import * as err from "./HttpError.js";

/**
 * Get a file's metadata from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} id - The full ArtifactDB identifier of the resource of interest.
 * @param {object} [options={}] - Optional parameters.
 * @param {boolean} [options.followLink=true] - Whether to follow links from redirection schemas.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {Object} Object containing the metadata for this file artifact.
 * This is guaranteed to contain at least the following properties:
 *
 * - `$schema`, a string specifying the schema for this metadata document.
 * - `path`, a string specifying the relative path of the file inside the project.
 *
 * @async
 */
export async function getFileMetadata(baseUrl, id, { followLink = true, getFun = null } = {}) {
    let out = baseUrl + "/files/" + encodeURIComponent(id) + "/metadata";
    if (followLink) {
        out += "?follow_link=true";
    }

    if (getFun === null) {
        getFun = fetch;
    }
    let res = await getFun(out);
    err.checkHttpResponse(res, "failed to retrieve metadata for '" + id + "'");
    return await res.json();
}
