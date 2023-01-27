import * as err from "./HttpError.js";
import * as gh from "./globalRequestHeaders.js";

/**
 * Download a file from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} id - The full ArtifactDB identifier of the resource of interest.
 * @param {object} [options={}] - Optional parameters.
 * @param {?function} [options.downloadFun=null] - Function that accepts a single string containing a URL and returns the resource at that URL.
 * The return value may be of any type but is generally expected to be either an ArrayBuffer/Uint8Array of the file contents or (for Node.js only) a string to a path containing the file contents.
 * By default, a request is performed using `getFun` and an ArrayBuffer is returned containing the contents of the file.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object.
 * Only used when `downloadFun` is not provided.
 * Defaults to the in-built `fetch` function with {@linkcode globalRequestHeaders}.
 *
 * @return {string|ArrayBuffer} Depending on `downloadFun`, either the contents of the file or a path to the file.
 * @async
 */
export async function getFile(baseUrl, id, { downloadFun = null, getFun = null } = {}) {
    let out = baseUrl + "/files/" + encodeURIComponent(id);

    if (downloadFun === null) {
        if (getFun === null) {
            getFun = gh.quickGet;
        }
        downloadFun = async x => {
            let res = await getFun(x);
            await err.checkHttpResponse(res, "failed to retrieve file for '" + id + "'");
            return await res.arrayBuffer();
        };
    }

    return await downloadFun(out);
}
