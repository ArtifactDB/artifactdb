import * as err from "./HttpError.js";
import * as ph from "./parseLinkHeader.js";
import * as gh from "./globalRequestHeaders.js";

/**
 * List the available projects from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.number=50] - Number of projects to return.
 * This may be interpreted by the API as a hint or as a maximum.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with the {@linkcode globalRequestHeaders}.
 *
 * @return {Object} Object containing:
 *
 * - `projects`, an array of objects where each object corresponds to a project and contains the `project` name and an array of strings containing the `versions`.
 * - `next_page`, a string containing the URL to the next page of projects, to be used as `pageUrl` in {@listProjectsNext}.
 *   If this is absent, it can be assumed that there are no further pages.
 *
 * @async
 */
export async function listProjects(baseUrl, { number = 50, getFun = null } = {}) {
    return listProjectsNext(baseUrl, "/projects", { number: number, getFun: getFun });
}

/**
 * Continue listing available projects from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} pageUrl - URL component to the next page of results.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.number=50] - Number of projects to return.
 * This may be interpreted by the API as a hint or as a maximum.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with the {@linkcode globalRequestHeaders}.
 *
 * @return {Object} Object containing:
 *
 * - `projects`, an array of objects where each object corresponds to a project and contains the `project` name and an array of strings containing the `versions`.
 * - `next_page`, a string containing the URL to the next page of projects, to be used in `pageUrl`.
 *   If this is absent, it can be assumed that there are no further pages.
 *
 * @async
 */
export async function listProjectsNext(baseUrl, linkUrl, { number = 50, getFun = null } = {}) {
    if (getFun === null) {
        getFun = gh.quickGet;
    }

    let collected = [];
    let pageFun = async res => {
        let info = await res.json();
        for (const x of info.results) {
            let versions = [];
            for (const y of x.aggs) {
                versions.push(y["_extra.version"]);
            }
            collected.push({ project: x.project_id, versions: versions });
        }
        return collected.length > number;
    };

    let link_url = await ph.paginateLinks(baseUrl, linkUrl, getFun, pageFun, "failed to list available projects"); 
    let output = { projects: collected };
    if (link_url !== null) {
        output.next_page = link_url;
    }

    return output;
}
