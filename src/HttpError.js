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

export async function checkHttpResponse(res, msg) {
    if (res.ok) {
        return;
    }

    let info = await res.json();
    if (info.status == "error") {
        throw new HttpError(msg + "; " + info.reason, res.status);
    } 

    throw new HttpError(msg, res.status);
}
