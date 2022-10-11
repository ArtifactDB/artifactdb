import * as adb from "../src/index.js";
import { exampleUrl } from "./utils.js";
import "isomorphic-fetch";

test("listProjects works correctly", async () => {
    // Not much to test here, given that we don't really have
    // enough projects in the test instance to hit the pagination,
    // nor can we guarantee that the test project is first.
    let listing = await adb.listProjects(exampleUrl);
    expect(listing.projects.length > 0);
    expect(listing.projects[0].versions.length > 0);
})
