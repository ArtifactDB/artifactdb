import * as adb from "../src/index.js";
import { exampleUrl, exampleId } from "./utils.js";
import "isomorphic-fetch";

test("getFile works correctly", async () => {
    let contents = await adb.getFile(exampleUrl, exampleId);
    expect(contents instanceof ArrayBuffer).toBe(true);

    let dec = new TextDecoder;
    let str = dec.decode(new Uint8Array(contents));
    let lines = str.split("\n");

    if (lines[lines.length - 1] == "") {
        lines.pop();
    }
    expect(lines.length).toBe(26);
    expect(lines[0]).toBe("A");
    expect(lines[25]).toBe("Z");
});
