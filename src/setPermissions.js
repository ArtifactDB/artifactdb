import * as err from "./HttpError.js";
import * as gh from "./globalRequestHeaders.js";
import * as gp from "./getPermissions.js";

/**
 * Set permissions for a project.
 *
 * @param {string} baseUrl - Base URL of the REST API.
 * @param {string} project - Name of the project.
 * @param {object} [options={}] - Optional parameters.
 * @param {?boolean} [options.isPublic=null] - Whether to make the project publicly visible.
 * If `null`, the visibility is unchanged.
 * @param {?Array} [options.viewers=null] - Array of strings containing the user names of the allowed viewers.
 * If `null`, the set of viewers is unchanged.
 * @param {?Array} [options.owners=null] - Array of strings containing the user names of the project owners.
 * If `null`, the set of owners is unchanged.
 * @param {string} [options.action="append"] - String specifying how to combine `viewers` and `owners` with the corresponding values in the existing permissions.
 *
 * - `"append"` will add any specified users to the existing set.
 * - `"remove"` will remove any specified users from the existing set.
 * - `"set"` will replace the existing set with the specified users.
 *
 * @param {?function} [options.getFun=null] - Function that accepts a single string containing a URL and returns a Response object, see {@linkcode getPermissions}.
 * @param {?function} [options.putFun=null] - Function that performs a PUT request and returns a Response object.
 * It should accept:
 *
 * - A string containing the request URL.
 * - An object containing the permissions to be sent in the request.
 * 
 * Defaults to the in-built `fetch` function with headers defined by {@linkcode globalRequestHeaders}.
 *
 * @return Permissions are set in the specified project.
 * Nothing is returned.
 */
export async function setPermissions(baseUrl, project, { isPublic = null, viewers = null, owners = null, action = "append", getFun = null, putFun = null } = {}) {
    let perm_req = create_request(baseUrl, project, isPublic, viewers, owners, action, getFun);
    let url = baseUrl + "/projects/" + encodeURIComponent(project) + "/permissions";

    if (putFun === null) {
        putFun = gh.quickPutJson;
    }

    let res = await putFun(url, perm_req);
    err.checkHttpResponse(res, "failed to set permissions for project '" + project + "'");

    return;
}

export async function create_request(baseUrl, project, { isPublic = null, viewers = null, owners = null, action = "append", getFun = null } = {}) {
    let perm_req = {};
    if (isPublic !== null) {
        perm_req.read_access = (isPublic ? "public" : "viewers");
    }

    if (action == "set") {
        if (viewers !== null) {
            perm_req.viewers = viewers;
        }
        if (owners !== null) {
            perm_req.owners = owners;
        }

    } else if (action != "append" && action != "remove") {
        throw new Error("unknown action '" + action + "' for setting permissions");

    } else if (viewers !== null || owners !== null) {
        let existing = await gp.getPermissions(baseUrl, project, { getFun: getFun });

        if (viewers !== null) {
            perm_req.viewers = add_or_remove_users(viewers, existing.viewers, action);
        }
        if (owners !== null) {
            perm_req.owners = add_or_remove_users(owners, existing.owners, action);
        }
    }
    return perm_req;
}

export function add_or_remove_users(x, old, action) {
    if (action == "append") {
        let already = new Set(old);
        let output = old.slice();
        for (const u of x) {
            if (!already.has(u)) {
                already.add(u);
                output.push(u);
            }
        }
        return output;
    }

    let remove_list= new Set(x);
    let output = [];
    for (const u of old) {
        if (!remove_list.has(u)) {
            output.push(u);
        }
    }
    return output;
}


