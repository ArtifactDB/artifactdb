import * as adb from "../src/index.js";
import { exampleUrl } from "./utils.js";
import "isomorphic-fetch";

test("getPermissions works correctly", async () => {
    let perms = await adb.getPermissions(exampleUrl, "test-zircon-upload");
    expect(perms.read_access).toBe("public");
    expect(perms.owners).toEqual([ "ArtifactDB-bot" ]);

    // Throws if it doesn't have permissions.
    await expect(adb.getPermissions(exampleUrl, "test-zircon-permissions")).rejects.toThrow("user credentials not supplied");
})
