import * as adb from "../src/index.js";
import { exampleUrl, exampleId } from "./utils.js";
import "isomorphic-fetch";

test("prepareCloneUpload works correctly", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public", { version: "base", raw: true });
    expect(res.length > 0);

    {
        let { metadata, links } = adb.prepareCloneUploadFromMetadata("test-public", "base", res, { stringify: false });
        expect(Object.keys(metadata).length).toBe(3);
        expect(Object.keys(links).length).toBe(3);
        expect(metadata["blah.txt.json"].path).toBe("blah.txt");
        expect(links["blah.txt"]).toBe("test-public:blah.txt@base");
    }

    {
        let { metadata, links } = adb.prepareCloneUploadFromMetadata("test-public", "base", res, { stringify: true });
        expect(typeof metadata["blah.txt.json"]).toBe("string");

        let yyy = await adb.prepareCloneUploadFromUrl(exampleUrl, "test-public", "base", { stringify: true });
        expect(metadata).toEqual(yyy.metadata)
        expect(links).toEqual(yyy.links)
    }
}) 

test("prepareCloneUpload fails correctly", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public", { version: "base" });
    expect(res.length > 0);
    expect(() => adb.prepareCloneUploadFromMetadata("test-public", "base", res, { stringify: false })).toThrow("_extra");

    res = [ { "path": "foo.json" }, { "path": "foo.json" } ];
    expect(() => adb.prepareCloneUploadFromMetadata("test-public", "base", res, { stringify: false })).toThrow("detected for metadata");

    res = [ { "path": "foo" }, { "path": "foo" } ];
    expect(() => adb.prepareCloneUploadFromMetadata("test-public", "base", res, { stringify: false })).toThrow("detected when creating links");
})
