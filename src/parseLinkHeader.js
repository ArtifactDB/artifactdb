import * as err from "./HttpError.js";

/**
 * Parse the link header to obtain the link URLs.
 *
 * @param {string} linkText - String in the `link` header.
 *
 * @return {Object} Object containing the link URLs, named according to the `rel=` specification.
 */
export function parseLinkHeader(linkText) {
    let links = linkText.split(", ");
    let output = {};
    for (const l of links) {
        let hits = l.match(/^<([^>]+)>; rel="([^"]+)"/);
        if (hits == null) {
            throw new Error("link text does not follow the expected format");
        }
        output[hits[2]] = hits[1];
    }
    return output;
}

export async function paginateLinks(baseUrl, linkUrl, getFun, pageFun, errorMessage) {
    let quittable = false;

    while (!quittable) {
        let res = await getFun(baseUrl + linkUrl);
        await err.checkHttpResponse(res, errorMessage);

        quittable = await pageFun(res);

        let link_text = res.headers.get("link");
        if (link_text === null) {
            return null;
        }

        let links = parseLinkHeader(link_text);
        if (!("more" in links)) {
            return null;
        }

        linkUrl = links.more;
    }

    return linkUrl;
}
