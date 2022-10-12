import * as adb from "../src/index.js";
import { exampleUrl } from "./utils.js";
import "isomorphic-fetch";
import * as crypto from "crypto";
import { contents } from "./mockUpload.js";

/**
 * Upload a persistent base for unit tests to deduplicate against.
 */

let startUrl = adb.createUploadStartUrl(exampleUrl, "test-js-upload", "base");
adb.globalRequestHeaders["Authorization"] = "Bearer " + process.env.GITHUB_TOKEN;

let paths = {};
for (const [k, v] of Object.entries(contents)) {
    paths[k] = crypto.createHash("md5").update(v).digest("hex");
}

let init = await adb.initializeUpload(startUrl, paths);
await adb.uploadFiles(exampleUrl, init, contents);
await adb.completeUpload(exampleUrl, init, { isPublic: false });
