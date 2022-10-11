/**
 * Representation of a HTTP response error.
 * The error message is captured in `message` as usual, but the HTTP status code may also be retrieved via the `statusCode` property.
 */
export class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.statusCode = code;
    }
}

export function checkResponse(res, msg) {
    if (res.ok) {
        return;
    }

    let info = await res.json();
    if (info.status == "error") {
        throw new err.HttpError(msg + "; " + info.reason, res.status);
    } 

    throw new err.HttpError(msg, res.status);
}
