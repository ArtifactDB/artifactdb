import * as adb from "../src/index.js";
import { exampleUrl } from "./utils.js";
import { contents } from "./mockUpload.js";
import * as crypto from "crypto";
import "isomorphic-fetch";

const maybe = process.env.GITHUB_TOKEN ? test : test.skip;

beforeAll(() => {
    if (process.env.GITHUB_TOKEN) {
        adb.globalRequestHeaders["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;
    }
});

afterAll(() => {
    delete adb.globalRequestHeaders["Authorization"];
});

maybe("basic uploads work correctly", async () => {
    let version = String(Date.now());
    let startUrl = adb.createUploadStartUrl(exampleUrl, "test-js-upload", version);

    let paths = {};
    for (const [k, v] of Object.entries(contents)) {
        paths[k] = crypto.createHash("md5").update(v).digest("hex");
    }

    let init = await adb.initializeUpload(startUrl, paths, { autoDedupMd5: false, expires: 1 });
    expect(init.presigned_urls.length).toBe(Object.values(contents).length);
    expect(init.links.length).toBe(0);

    await adb.uploadFiles(exampleUrl, init, contents);
    let results = await adb.completeUpload(exampleUrl, init, { isPublic: false });
    expect(results.indexed).toBe(true);

    // Checking the results.
    let stuff = await adb.getFile(exampleUrl, adb.packId("test-js-upload", "Sebastien.txt", version));
    const dec = new TextDecoder;
    expect(dec.decode(stuff)).toBe("Je suis une pizza.");

    let meta = await adb.getFileMetadata(exampleUrl, adb.packId("test-js-upload", "Sebastien.txt", version));
    expect(meta.path).toBe("Sebastien.txt");
    expect("transient" in meta["_extra"]).toBe(true);
})

maybe("MD5-based uploads work correctly", async () => {
    let version = String(Date.now());
    let startUrl = adb.createUploadStartUrl(exampleUrl, "test-js-upload", version);

    let paths = {};
    let dedupable = {};
    for (const [k, v] of Object.entries(contents)) {
        let md5 = crypto.createHash("md5").update(v).digest("hex");
        if (k.endsWith(".json") || k.startsWith("Aaron")) {
            paths[k] = md5;
        } else {
            dedupable[k] = md5;
        }
    }

    let init = await adb.initializeUpload(startUrl, paths, { dedupMd5Paths: dedupable, expires: 1 });
    expect(init.presigned_urls.length).toBe(3); // not quite the size of 'paths' because Aaron.txt gets dedupped as well. 
    expect(init.links.length).toBe(3);

    await adb.uploadFiles(exampleUrl, init, contents);
    let results = await adb.completeUpload(exampleUrl, init, { isPublic: false });
    expect(results.indexed).toBe(true);

    // Checking the results.
    let stuff = await adb.getFile(exampleUrl, adb.packId("test-js-upload", "Aaron.txt", version));
    const dec = new TextDecoder;
    expect(dec.decode(stuff)).toBe("My name is Aaron Lun.");

    let ameta = await adb.getFileMetadata(exampleUrl, adb.packId("test-js-upload", "Aaron.txt", version)); 
    expect(ameta.path).toBe("Aaron.txt");
    expect(ameta["_extra"].link.artifactdb).toBe("test-js-upload:Aaron.txt@base"); // autodedup works 

    let smeta = await adb.getFileMetadata(exampleUrl, adb.packId("test-js-upload", "Sebastien.txt", version));
    expect(smeta.path).toBe("Sebastien.txt");
    expect(smeta["_extra"].link.artifactdb).toBe("test-js-upload:Sebastien.txt@base"); // manual dedup works.
})

maybe("link-based uploads work correctly", async () => {
    let version = String(Date.now());
    let startUrl = adb.createUploadStartUrl(exampleUrl, "test-js-upload", version);

    let paths = {};
    let dedupable = {};
    for (const [k, v] of Object.entries(contents)) {
        let md5 = crypto.createHash("md5").update(v).digest("hex");
        if (k.endsWith(".json")) {
            paths[k] = md5;
        } else {
            dedupable[k] = adb.packId("test-js-upload", k, "base");
        }
    }

    let init = await adb.initializeUpload(startUrl, paths, { dedupLinkPaths: dedupable, expires: 1 });
    expect(init.presigned_urls.length).toBe(Object.keys(paths).length); 
    expect(init.links.length).toBe(Object.keys(dedupable).length);

    await adb.uploadFiles(exampleUrl, init, contents);
    let results = await adb.completeUpload(exampleUrl, init, { isPublic: false });
    expect(results.indexed).toBe(true);

    // Checking the results.
    let stuff = await adb.getFile(exampleUrl, adb.packId("test-js-upload", "Aaron.txt", version));
    const dec = new TextDecoder;
    expect(dec.decode(stuff)).toBe("My name is Aaron Lun.");

    let meta = await adb.getFileMetadata(exampleUrl, adb.packId("test-js-upload", "Jayaram.txt", version)); 
    expect(meta.path).toBe("Jayaram.txt");
    expect(meta["_extra"].link.artifactdb).toBe("test-js-upload:Jayaram.txt@base"); 
})

maybe("upload wrapper works correctly", async () => {
    let checksums = {};
    for (const [k, v] of Object.entries(contents)) {
        checksums[k] = crypto.createHash("md5").update(v).digest("hex");
    }

    let version = String(Date.now());
    await adb.uploadProject(exampleUrl, "test-js-upload", version, checksums, contents, { initArgs: { expires: 1 } });

    // Checking the results.
    let stuff = await adb.getFile(exampleUrl, adb.packId("test-js-upload", "Sebastien.txt", version));
    const dec = new TextDecoder;
    expect(dec.decode(stuff)).toBe("Je suis une pizza.");
})
