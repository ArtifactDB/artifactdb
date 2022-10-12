import * as adb from "../src/index.js";
import { exampleUrl } from "./utils.js";
import "isomorphic-fetch";

test("listProjectVersions works correctly", async () => {
    let listing = await adb.listProjectVersions(exampleUrl, "test-public");
    expect(listing.versions.indexOf("base")).toBeGreaterThan(-1);
    expect(listing.versions.indexOf("modified")).toBeGreaterThan(-1);
    expect(listing.latest).toBe('modified');
})
