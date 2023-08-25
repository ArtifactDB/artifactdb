import * as up from "./uploadFiles.js";

/**
 * Upload a project's files to an ArtifactDB instance.
 *
 * @param {string} baseUrl - Base URL of the ArtifactDB REST API.
 * @param {string} project - Name of the project.
 * @param {string} version - Version to be uploaded.
 * @param {Object} checksums - Object describing the to-be-uploaded files in the new project.
 * Keys are the relative paths of the files inside the project, and values are their MD5 checksums.
 * @param {Object} contents - Object where each entry corresponds to a file to be uploaded.
 * Each key should be a relative path, and each value represents the contents of the file (typically a string or ArrayBuffer).
 * See {@linkcode uploadFiles} for more details.
 * @param {Object} [options={}] - Optional parameters.
 * @param {Object} [options.initArgs={}] - Further arguments to pass to {@linkcode initializeUpload}.
 * @param {Object} [options.uploadArgs={}] - Further arguments to pass to {@linkcode uploadFiles}.
 * @param {Object} [options.completeArgs={}] - Further arguments to pass to {@linkcode completeUpload}.
 * @param {Object} [options.abortArgs={}] - Further arguments to pass to {@linkcode abortUpload}.
 *
 * @return On success, a new version of the project is created on the ArtifactDB backend.
 */
export async function uploadProject(baseUrl, project, version, checksums, contents, { initArgs = {}, uploadArgs = {}, completeArgs = {}, abortArgs = {} } = {}) {
    let start_url = up.createUploadStartUrl(baseUrl, project, version);

    let init = await up.initializeUpload(start_url, checksums, initArgs);
    try {
        await up.uploadFiles(baseUrl, init, contents, uploadArgs);
        await up.completeUpload(baseUrl, init, completeArgs);
    } catch (e) {
        // Try to abort it, but make sure we throw the original error if we can't.
        try {
            await up.abortUpload(baseUrl, init);
        } finally {}
        throw e;
    }

    return;
}
