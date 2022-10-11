import * as err from "./HttpError.js";

/**
 * Download a file from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} id - The full ArtifactDB identifier of the resource of interest.
 * @param {object} [options={}] - Optional parameters.
 * @param {?function} [options.downloadFun=null] - Function that accepts a single string containing a URL and returns either:
 *
 * - A string containing a path, for Node.js.
 * - An ArrayBuffer containing the contents of the file, for Node.js and browsers.
 *
 * Defaults to a call to `getFun`.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object.
 * Only used when `downloadFun` is not provided.
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {string|ArrayBuffer} Depending on `downloadFun`, either the contents of the file or a path to the file.
 * @async
 */
export async function getFile(baseUrl, id, { downloadFun = null, getFun = null } = {}) {
    let out = baseUrl + "/files/" + encodeURIComponent(id);

    if (downloadFun === null) {
        if (getFun === null) {
            getFun = fetch;
        }
        downloadFun = async x => {
            let res = await getFun(x);
            await err.checkHttpResponse(res, "failed to retrieve file for '" + id + "'");
            return await res.arrayBuffer();
        };
    }

    return await downloadFun(out);
}
