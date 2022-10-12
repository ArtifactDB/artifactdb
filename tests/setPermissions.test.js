import * as adb from "../src/index.js";
import * as setperm from "../src/setPermissions.js";
import { exampleUrl, setupToken, wipeToken } from "./utils.js";
import "isomorphic-fetch";

test("adding or removing users works correctly", () => {
    let out = setperm.add_or_remove_users(["Foo", "Bar"], ["Whee"], "append");
    expect(out).toEqual(["Whee", "Foo", "Bar"]);

    out = setperm.add_or_remove_users(["Foo", "Bar"], ["Bar"], "append");
    expect(out).toEqual(["Bar", "Foo"]);

    out = setperm.add_or_remove_users(["Foo", "Bar"], ["Bar"], "remove");
    expect(out).toEqual([]);

    out = setperm.add_or_remove_users(["Foo"], ["Foo", "Bar"], "remove");
    expect(out).toEqual(["Bar"]);
})

test("request construction works correctly", async () => {
    let exampleProject = "test-public";

    {
        let out = await setperm.create_request(exampleUrl, exampleProject, { isPublic: false });
        expect(out).toEqual({ read_access: "viewers" });

        out = await setperm.create_request(exampleUrl, exampleProject, { isPublic: true });
        expect(out).toEqual({ read_access: "public" });
    }

    {
        let out = await setperm.create_request(exampleUrl, exampleProject, { viewers: [ "foo" ], action: "set" });
        expect(out).toEqual({ viewers: [ "foo" ] });

        out = await setperm.create_request(exampleUrl, exampleProject, { viewers: [ "foo" ], owners: [ "bar" ], action: "set" });
        expect(out).toEqual({ viewers: [ "foo" ], owners: [ "bar" ] });
    }

    {
        let out = await setperm.create_request(exampleUrl, exampleProject, { viewers: [ "foo" ], owners: [ "bar" ] });
        expect(out).toEqual({ viewers: [ "foo" ], owners: [ "ArtifactDB-bot", "bar"] });

        out = await setperm.create_request(exampleUrl, exampleProject, { owners: [ "ArtifactDB-bot" ], action: "remove" });
        expect(out).toEqual({ owners: [] });
    }
})

describe("setPermissions works correctly", () => {
    const maybe = process.env.GITHUB_TOKEN ? test : test.skip;

    beforeAll(setupToken);
    afterAll(wipeToken);

    maybe("setPermissions works correctly", async () => {
        let exampleProject = "test-js-upload";

        await adb.setPermissions(exampleUrl, exampleProject, { isPublic: true, viewers: [ "lawremi" ] });
        await (new Promise(resolve => setTimeout(resolve, 3000))); // wait a bit for the change to occur in the file store.
        let res = await fetch(exampleUrl + "/projects/" + exampleProject + "/permissions?force_reload=true", { headers: adb.globalRequestHeaders }); // force a reload of the cache.
        expect(res.ok).toBe(true);
        let perms = await res.json();
        expect(perms.read_access).toBe("public");
        expect(perms.viewers).toEqual([ "lawremi" ]);

        await adb.setPermissions(exampleUrl, exampleProject, { isPublic: false, viewers: [ "lawremi" ], action: "remove" });
        await (new Promise(resolve => setTimeout(resolve, 3000))); // wait a bit for the change to occur.
        res = await fetch(exampleUrl + "/projects/" + exampleProject + "/permissions?force_reload=true", { headers: adb.globalRequestHeaders });
        expect(res.ok).toBe(true);
        perms = await res.json();
        expect(perms.read_access).toBe("viewers");
        expect(perms.viewers).toEqual([]);
    });
})
