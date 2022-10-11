import * as err from "./HttpError.js";
import * as ph from "./parseLinkHeader.js";

/**
 * Get a project's metadata from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?string} [options.version=null] version - Version of interest.
 * If `null`, the constructed endpoint will return metadata for all versions of the project.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {string} Array of objects containing metadata for each file artifact in this project, or a specific version of the project.
 */
export async function getProjectMetadata(baseUrl, project, { version = null, getFun = null } = {}) {
    let url = baseUrl + "/projects/" + encodeURIComponent(project);
    if (version !== null) {
        url += "/version/" + encodeURIComponent(version);
    }
    url += "/metadata;

    if (getFun === null) {
        getFun = fetch;
    }

    let collected = [];
    while (1) {
        let res = await getFun(url);
        err.checkHttpResponse(res, "failed to get metadata for '" + project + "'");

        let info = await res.json();
        for (const x of info.results) {
            collected.push(x);
        }

        let link_text = res.headers.get("link");
        if (link_text === null) {
            break;
        }

        let links = ph.parseLinkHeader(link_text);
        if (!("more" in links)) {
            break;
        }

        url = baseUrl + links.more;
    }

    return collected;
}
