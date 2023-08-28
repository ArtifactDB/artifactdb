import * as err from "./HttpError.js";
import * as ph from "./parseLinkHeader.js";
import * as gh from "./globalRequestHeaders.js";
import { packId} from "./packId.js";
import { getFileMetadata } from "./getFileMetadata.js";

/**
 * Get a project's metadata from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?string} [options.version=null] version - Version of interest.
 * If `null`, the constructed endpoint will return metadata for all versions of the project.
 * @param {?number} [options.number=null] - Number of metadata entries to return in the first page.
 * This may be interpreted by the API as a hint or as a maximum.
 * If `null`, all metadata entries for this (version of the) project are returned, with no further pagination.
 * @param {boolean} [options.raw=false] - Whether to download the raw metadata from S3.
 * This is slower but avoids some loss of information due to Elasticsearch transformations.
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
export async function getProjectMetadata(baseUrl, project, { version = null, number = null, raw = false, getFun = null } = {}) {
    let page_url = "/projects/" + encodeURIComponent(project);
    if (version !== null) {
        page_url += "/version/" + encodeURIComponent(version);
    }
    page_url += "/metadata";

    if (number == null) {
        number = Number.POSITIVE_INFINITY;
    }
    return getProjectMetadataNext(baseUrl, page_url, { number: number, raw: raw, getFun: getFun });
}

/**
 * Continue listing available projects from an ArtifactDB REST API.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} pageUrl - URL component to the next page of results.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.number=50] - Number of metadata entries to return in the current page.
 * This may be interpreted by the API as a hint or as a maximum.
 * @param {boolean} [options.raw=false] - Whether to download the raw metadata from S3.
 * This is slower but avoids some loss of information due to Elasticsearch transformations.
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
export async function getProjectMetadataNext(baseUrl, pageUrl, { number = 50, raw = false, getFun = null } = {}) {
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

    if (raw) {
        let promised = [];
        for (const x of output.metadata) {
            if ("_extra" in x) {
                // fishing it out of the 'extra' section.
                let id = packId(x._extra.project_id, x.path, x._extra.version)
                promised.push(getFileMetadata(baseUrl, id, { follow_link: false, raw: raw, getFun: getFun }));
            } else {
                promised.push(x)
            }
        }
        output.metadata = await Promise.all(promised);
    }

    return output;
}
