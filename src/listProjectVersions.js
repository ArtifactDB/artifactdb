import * as err from "./HttpError.js";

/**
 * List the available versions from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {Object} Object containing:
 *
 * - `versions`, an array of strings with the names of available versions;
 * - `latest`, a string specifying the latest version.
 *
 * @async
 */
export async function listProjectVersions(baseUrl, project, { getFun = null } = {}) {
    let out = baseUrl + "/projects/" + encodeURIComponent(project) + "/versions";

    if (getFun === null) {
        getFun = fetch;
    }
    let res = await getFun(out);
    await err.checkHttpResponse(res, "failed to list project versions for '" + project + "'");

    let info = await res.json();
    let versions = [];
    for (const x of info.aggs) {
        versions.push(x["_extra.version"]);
    }

    return { 
        versions: versions,
        latest: info["latest"]["_extra.version"]
    };
}
