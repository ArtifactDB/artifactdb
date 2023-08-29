import * as adb from "../src/index.js";
import { exampleUrl, exampleId } from "./utils.js";
import "isomorphic-fetch";

test("prepareCloneUpload works correctly", async () => {
    let res = await adb.getProjectMetadata(exampleUrl, "test-public", { version: "base" });
    expect(res.length > 0);

    {
        let { metadata, links } = adb.prepareCloneUpload(res, { stringify: false });
        expect(Object.keys(metadata).length).toBe(3);
        expect(Object.keys(links).length).toBe(3);
        expect(metadata["blah.txt.json"].path).toBe("blah.txt");
        expect(links["blah.txt"]).toBe("test-public:blah.txt@base");
    }

    {
        let { metadata, links } = adb.prepareCloneUpload(res, { stringify: true });
        expect(typeof metadata["blah.txt.json"]).toBe("string");
    }
}) 
