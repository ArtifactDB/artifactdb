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
        if (hits.length != 3) {
            throw new Error("link text does not follow the expected format");
        }
        output[hits[2]] = hits[1];
    }
    return output;
}
