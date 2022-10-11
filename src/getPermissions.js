import * as err from "./HttpError.js";

/**
 * Get permissions for a project.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object.
 * Defaults to the in-built `fetch` function with no further arguments.
 *
 * @return {Object} The permissions of the project.
 * This is guaranteed to contain:
 *
 * - `scope`: string specifying the scope of the permissions, either `"project"` or `"version"`.
 * - `read_access`: string specifying who is allowed to read the project.
 *    This should be one of `"public"`, `"viewers"`, `"owners"` or `"none"`.
 * - `write_access`: string specifying who is allowed to update the project.
 *    This should be one of `"owners"` or `"none"`.
 * - `viewers`: array of strings specifying the users with read permissions.
 * - `owners`: array of strings specifying the users with write permissions.
 */
export async function getPermissions(baseUrl, project, { getFun = null } = {}) {
    let url = baseUrl + "/projects/" + encodeURIComponent(project) + "/permissions";

    if (getFun == null) {
        getFun = fetch;
    }

    let res = await getFun(url);
    await err.checkHttpResponse(res, "failed to fetch permissions for project '" + project + "'");

    return await res.json();
}
