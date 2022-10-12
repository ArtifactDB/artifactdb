import * as adb from "../src/index.js";
import { exampleUrl, setupToken, wipeToken } from "./utils.js";
import "isomorphic-fetch";

test("getPermissions works correctly", async () => {
    let perms = await adb.getPermissions(exampleUrl, "test-public");
    expect(perms.read_access).toBe("public");
    expect(perms.owners).toEqual([ "ArtifactDB-bot" ]);
})

test("getPermissions fails correctly without identification", async () => {
    await expect(adb.getPermissions(exampleUrl, "test-private")).rejects.toThrow("user credentials not supplied");
})

describe("getPermissions works correctly for private projects", () => {
    beforeAll(setupToken);
    afterAll(wipeToken);

    const maybe = process.env.GITHUB_TOKEN ? test : test.skip;
    maybe("works correctly with identification", async () => {
        let perms = await adb.getPermissions(exampleUrl, "test-private");
        expect(perms.read_access).toBe("viewers");
        expect(perms.owners).toEqual([ "ArtifactDB-bot" ]);
    })
})
