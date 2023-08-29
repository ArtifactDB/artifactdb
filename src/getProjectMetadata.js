import * as err from "./HttpError.js";
import * as ph from "./parseLinkHeader.js";
import * as gh from "./globalRequestHeaders.js";
import { packId} from "./packId.js";
import { getFileMetadata } from "./getFileMetadata.js";

/**
 * Get a project's metadata from an ArtifactDB REST API.
 * This combines {@linkcode getProjectMetadataStart} and {@linkcode getProjectMetadataNext} to obtain metadata for all files.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?string} [options.version=null] - Version of interest.
 * If `null`, the constructed endpoint will return metadata for all versions of the project.
 * @param {number} [options.number=Number.POSITIVE_INFINITY] - Approximate number of metadata entries to return. 
 * This may be interpreted by the API as a hint or as a maximum; the exact number returned may be different. 
 * @param {boolean} [options.raw=false] - Whether to download the raw metadata from S3, see the argument of the same name in {@linkcode getFileMetadata}.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with the {@linkcode globalRequestHeaders}.
 *
 * @return {Array} Array of objects containing metadata for each file artifact in this project, or a specific version of the project.
 * Each object is of the same format as described in {@linkcode getFileMetadata}.
 *
 * @async
 */
export async function getProjectMetadata(baseUrl, project, { version = null, number = Number.POSITIVE_INFINITY, raw = false, getFun = null } = {}) {
    let page_url = getProjectMetadataStart(project, version);

    let collected = [];
    while (collected.length < number) {
        let current = await getProjectMetadataNext(baseUrl, page_url, { number: number, getFun: getFun });

        for (const x of current.metadata) {
            collected.push(x);
        }

        if ("next_page" in current) {
            page_url = current.next_page;
        } else {
            break;
        }
    }

    if (raw) {
        let promised = [];
        for (const x of collected) {
            let curversion = version;
            if (curversion == null) {
                if ("_extra" in x) {
                    curversion = x._extra.version;
                }
            }

            if (curversion !== null) {
                let id = packId(project, x.path, curversion);
                promised.push(getFileMetadata(baseUrl, id, { followLink: false, raw: true, getFun: getFun }));
            } else {
                promised.push(x)
            }
        }
        collected = await Promise.all(promised);
    }

    return collected;
}

/**
 * Obtain the endpoint to list a project's metadata from an ArtifactDB REST API.
 *
 * @param {string} project - Name of the project.
 * @param {?string} version - Version of interest.
 * If `null`, the constructed endpoint will return metadata for all versions of the project.
 *
 * @return {string} String containing the endpoint to use as `pageUrl` in {@linkcode getProjectMetadataNext}.
 */
export function getProjectMetadataStart(project, version) {
    let page_url = "/projects/" + encodeURIComponent(project);
    if (version !== null) {
        page_url += "/version/" + encodeURIComponent(version);
    }
    page_url += "/metadata";
    return page_url;
}

/**
 * Continue listing a project's metadata from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} pageUrl - URL component to the next page of results.
 * For the first invocation of this function, users should obtain the URL from {@linkcode getProjectMetadataStart}.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.number=50] - Approximate number of metadata entries to return in the current page.
 * This may be interpreted by the API as a hint or as a maximum; the exact number returned may be different. 
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object (or a promise resolving to a Response).
 * Defaults to the in-built `fetch` function with the {@linkcode globalRequestHeaders}.
 *
 * @return {Object} Object containing:
 *
 * - `metadata`, an array of objects containing metadata for each file artifact in this project, or a specific version of the project.
 *   Each object is of the same format as described in {@linkcode getFileMetadata}.
 * - `next_page`, a string containing the URL to the next page of file metadata, to be used as `pageUrl`.
 *   If this is absent, it can be assumed that there are no further pages.
 *
 * @async
 */
export async function getProjectMetadataNext(baseUrl, pageUrl, { number = 50, getFun = null } = {}) {
    if (getFun === null) {
        getFun = gh.quickGet;
    }

    let collected = [];
    let pageFun = async res => {
        let info = await res.json();
        for (const x of info.results) {
            collected.push(x);
        }
        return collected.length > number;
    };

    let next_url = await ph.paginateLinks(baseUrl, pageUrl, getFun, pageFun, "failed to get project metadata");
    let output = { metadata: collected };
    if (next_url !== null) {
        output.next_page = next_url;
    }

    return output;
}
