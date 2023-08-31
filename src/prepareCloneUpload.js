import { packId } from "./packId.js";
import { getProjectMetadata } from "./getProjectMetadata.js";

/**
 * Fetch a project version's metadata and prepare a clone for upload.
 * This is a convenience wrapper around {@linkcode getProjectMetadata} and {@linkcode prepareCloneUploadFromMetadata};
 * see the latter for more details.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {string} version - Version of interest.
 * @param {Object} [options={}] - Optional parameters.
 * @param {boolean} [options.stringify=true] - See {@linkcode prepareCloneUploadFromMetadata} for more details.
 * @param {?function} [options.getFun=null] - See {@linkcode getProjectMetadata} for more details.
 *
 * @return {Object} Object containing values to be used for uploaded, see {@linkcode prepareCloneUploadFromMetadata} for more details.
 */
export async function prepareCloneUploadFromUrl(baseUrl, project, version, { stringify = true, getFun = null }) {
    let metadata = await getProjectMetadata(baseUrl, project, { version: version, raw: true, getFun: getFun });
    return prepareCloneUploadFromMetadata(project, version, metadata, { stringify });
}

/**
 * Prepare a clone of a project's version using its metadata.
 * This enables lightweight creation of new project versions without downloading each file and re-uploading them.
 * However, the same approach can be used to clone a project version under a completely different project name.
 *
 * @param {string} project - Name of the project.
 * @param {string} version - Version of interest.
 * @param {Array} metadata - Array of objects containing the metadata for the specified version,
 * typically generated from {@linkcode getProjectMetadata} with `raw = true`.
 * @param {Object} [options={}] - Optional parameters.
 * @param {boolean} [options.stringify=true] - Whether the metadata should be stringified in the return value.
 * Setting this to `false` is useful when further modifications to the metadata are to be performed.
 *
 * @return {Object} An object containing:
 *
 * - `metadata`: object containing the JSON metadata for all files.
 *   Keys are the relative paths to the metadata files themselves (not the file artifacts), while values are the metadata objects for those files.
 *   This should used as `contents` in {@linkcode uploadProject} or {@linkcode uploadFiles} (after stringification if `stringify = false`).
 * - `links`: object containing the links to be created to the existing version of a project.
 *   Keys are the relative paths of the file artifacts to be linked from, while values are the ArtifactDB identifiers of the artifacts to be linked to.
 *   This should be used as `dedupLinkPaths` in {@linkcode initializeUpload} or {@linkcode uploadProject} (via `initArgs`).
 */
export function prepareCloneUploadFromMetadata(project, version, metadata, { stringify = true } = {}) {
    let contents = {};
    let links = {};

    for (const x of metadata) {
        if ("_extra" in x) {
            throw new Error("raw metadata should not contain an '_extra' property");
        }

        let key = x.path;
        if (!key.endsWith(".json")) {
            if (key in links) {
                throw new Error("duplicate key '" + key + "' detected when creating links");
            }
            links[key] = packId(project, x.path, version);
            key += ".json";
        }

        if (key in contents) {
            throw new Error("duplicate key '" + key + "' detected for metadata");
        }

        let basic = { ...x };
        if (stringify) {
            contents[key] = JSON.stringify(basic);
        } else {
            contents[key] = basic;
        }
    }

    return { metadata: contents, links: links };
}
