import * as adb from "../src/index.js";
import * as setperm from "../src/setPermissions.js";
import { exampleUrl } from "./utils.js";
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
    let exampleProject = "test-zircon-upload";

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

const maybe = process.env.GITHUB_TOKEN ? test : test.skip;

maybe("setPermissions works correctly", async () => {
    adb.globalRequestHeaders["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;
    let exampleProject = "test-zircon-permissions";

    let perms = await adb.getPermissions(exampleUrl, exampleProject);
    expect(perms.read_access).toBe("viewers");

    await adb.setPermissions(exampleUrl, exampleProject, { isPublic: true, viewers: [ "lawremi" ] });
    expect(perms.read_access).toBe("public");
    expect(perms.viewers).toBe([ "lawremi" ]);

    await adb.setPermissions(exampleUrl, exampleProject, { isPublic: false, viewers: [ "lawremi" ], action: "remove" });
    expect(perms.read_access).toBe("read_access");
    expect(perms.viewers).toBe([]);
})
