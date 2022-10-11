import * as adb from "../src/index.js";
import { exampleUrl, exampleId } from "./utils.js";
import "isomorphic-fetch";

test("getFileMetadata works correctly", async () => {
    let contents = await adb.getFileMetadata(exampleUrl, exampleId);
    let unpacked = adb.unpackId(exampleId);

    expect(contents.path).toBe(unpacked.path);
    expect(contents["_extra"]["project_id"]).toBe(unpacked.project);
    expect(contents["_extra"]["version"]).toBe(unpacked.version);
})

test("getFileMetadata follows links correctly", async () => {
    let contents = await adb.getFileMetadata(exampleUrl, "test-zircon-link:redirect@base");
    expect(contents.path).toBe("foo/bar.txt");
    expect(contents["$schema"]).toMatch("generic_file/");

    let contents2 = await adb.getFileMetadata(exampleUrl, "test-zircon-link:redirect@base", { followLink: false });
    expect(contents2["$schema"]).toMatch("redirection/");
})

