/**
 * Prepare a clone of a project's version using its metadata.
 * This enables lightweight creation of new project versions without downloading each file and re-uploading them.
 * However, the same approach can be used to clone a project version under a completely different project name.
 *
 * @param {Array} metadata - Array of objects containing the metadata for a particular version of a project, typically from {@linkcode getProjectMetadata}.
 * @param {Object} [options={}] - Optional parameters.
 * @param {boolean} [options.stringify=true] - Whether the metadata should be stringified in the return value.
 * Setting this to `false` is useful when further modifications to the metadata are to be performed.
 *
 * @return {Object} An object containing:
 *
 * - `metadata`: object containing the JSON metadata for all files.
 *   Keys are the relative paths to the metadata files themselves (not the file artifacts), while values are the metadata objects for those files.
 *   This should used as `contents` in {@linkcode uploadProject} or {@linkcode initializeUpload} (after stringification if `stringify = false`).
 * - `links`: object containing the links to be created to the existing version of a project.
 *   Keys are the relative paths of the file artifacts to be linked from, while values are the ArtifactDB identifiers of the artifacts to be linked to.
 *   This should be used as `dedupLinkPaths` in {@linkcode uploadProject} or {@linkcode initializeUpload}.
 */
export function prepareCloneUpload(metadata, { stringify = true } = {}) {
    let contents = {};
    let links = {};

    for (const x of metadata) {
        let key = x.path;
        if (!(key.endsWith(".json"))) {
            links[key] = x["_extra"]["id"];
            key += ".json";
        }

        let basic = { ...x };
        delete basic._extra;
        if (stringify) {
            contents[key] = JSON.stringify(basic);
        } else {
            contents[key] = basic;
        }
    }

    return { metadata: contents, links: links };
}
