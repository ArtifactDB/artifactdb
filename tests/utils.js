import * as adb from "../src/index.js";

export const exampleId = "test-zircon-upload:blah.txt@base";
export const exampleUrl = "https://gypsum-test.aaron-lun.workers.dev";

export function setupToken() {
    if (process.env.GITHUB_TOKEN) {
        adb.globalRequestHeaders["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;
    }
}

export function wipeToken() {
    delete adb.globalRequestHeaders["Authorization"];
}
