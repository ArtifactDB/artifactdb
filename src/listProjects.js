import * as err from "./HttpError.js";
import * as ph from "./parseLinkHeader.js";

/**
 * List the available projects from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.number=50] - Approximate number of projects to return.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {Object} Object containing:
 *
 * - `projects`, an array of objects where each object corresponds to a project and contains the `project` name and an array of strings containing the `versions`.
 * - `truncated`, a boolean indicating whether the results were truncated by `number`.
 */
export async function listProjects(baseUrl, { number = 50, getFun = null } = {}) {
    let url = baseUrl + "/projects";

    if (getFun === null) {
        getFun = fetch;
    }

    let collected = [];
    while (collected.length <= number) {
        let res = await getFun(url);
        err.checkHttpResponse(res, "failed to list available projects"); 

        let info = await res.json();
        for (const x of info) {
            let versions = [];
            for (const y of x.agg) {
                versions.push(y["_extra.version"];
            }
            collected.push({ project: x.project_id, versions: versions });
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

    let truncated = collected.length > number;
    while (collected.length > number) {
        collected.pop();
    }

    return { projects: collected, truncated: truncated };
}
