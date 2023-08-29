import * as adb from "../src/index.js";
import { exampleUrl, exampleId } from "./utils.js";
import "isomorphic-fetch";

test("getProjectMetadata works correctly", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public");
    expect(res.length > 0);

    // Double-check that we get the same results.
    let first = res[0];
    let first_again = await adb.getFileMetadata(exampleUrl, first["_extra"]["id"]);
    expect(first_again).toEqual(first);
}) 

test("getProjectMetadata works correctly for a specific version", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public", { version: "base" });
    expect(res.length > 0);

    let available = new Set;
    for (const x of res) {
        available.add(x._extra.version);
    }

    let versions = Array.from(available);
    expect(versions.length).toBe(1);
    expect(versions[0]).toBe("base");
})

test("getFileMetadata obtains raw metadata correctly", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public", { raw: true });
    expect(res.length > 0);
    for (const x of res) {
        expect("$schema" in x).toBe(true);
        expect("_extra" in x).toBe(false) 
    }
})

