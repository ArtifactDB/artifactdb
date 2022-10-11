/**
 * Implements a default method to get a JSON response from a URL.
 * This may be used in the `getMetadata()` method of a {@linkplain Resource} subclass. 
 *
 * @param {string} url - URL returning a JSON response.
 * @param {object} [options={}] - Optional parameters.
 * @param {?string} [options.cache=null] - Path to a cache directory for Node.js.
 * If `null`, no caching is performed.
 * This option is ignored for browsers.
 * @param {?string} [options.key=null] - A unique cache key for Node.js.
 * If `null`, defaults to the URL-encoded string of `url`. 
 * This option is ignored for browsers.
 *
 * @return {object} Object containing the resource's metadata.
 * @async
 */
export async function getJson(url, { cache = null, key = null } = {}) {
    var res = await fetch(url);
    if (!res.ok) {
        throw new Error("failed to fetch JSON from '" + url + "' (HTTP " + String(res.status) + ")");
    }
    return await res.json();
}

/**
 * Implements a default method to download a file.
 * This may be used in the `downloadFile()` method of a {@linkplain Resource} subclass.
 *
 * @param {string} url - URL to a file.
 * @param {object} [options={}] - Optional parameters.
 * @param {?string} [options.cache=null] - Path to a cache directory for Node.js.
 * If `null`, no caching is performed.
 * This option is ignored for browsers.
 * @param {?string} [options.key=null] - A unique cache key for Node.js.
 * If `null`, defaults to the URL-encoded string of `url`. 
 * This option is ignored for browsers.
 * @param {boolean} [options.forceBuffer=true] - Whether to return an ArrayBuffer containing the file's contents. 
 * If `false`, a file path may be returned instead for Node.js.
 * This option is ignored for browsers.
 *
 * @return {string|ArrayBuffer} ArrayBuffer containing the resource contents.
 * Alternatively, a string containing a file path to the downloaded resource, if `forceBuffer = false` and `cache` is provided on Node.js.
 * @async
 */
export async function getFile(url, { cache = null, key = null, forceBuffer = true } = {}) {
    var res = await fetch(url)
    if (!res.ok) {
        throw new Error("failed to download file from '" + url + "' (HTTP " + String(res.status) + ")");
    }
    return await res.arrayBuffer();
}
