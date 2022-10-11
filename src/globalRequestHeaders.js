/**
 * Headers to be attached to all HTTP requests using the default functions (typically based on `fetch`).
 * Keys are the header names while values are the header contents.
 * This is mainly used to set the `Authorization` header for authentication.
 */
export var globalRequestHeaders = {};

export function quickGet(url) {
    return fetch(url, { headers: globalRequestHeaders });
}

export function quickPutJson(url, body) {
    let opt = { 
        method: "PUT", 
        headers: { ...globalRequestHeaders }
    };

    if (body) {
        opt.headers["Content-Type"] = "application/json";
        opt.body = JSON.stringify(body);
    }

    return fetch(url, opt);
}
