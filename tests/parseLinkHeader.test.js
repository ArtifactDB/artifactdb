import * as adb from "../src/index.js";

test("parsing the link header works properly", () => {
    let deets = adb.parseLinkHeader('</foo/bar>; rel="next", </whee/stuff/thing>; rel="more"');
    expect(deets.next).toBe("/foo/bar");
    expect(deets.more).toBe("/whee/stuff/thing");

    deets = adb.parseLinkHeader('</foo/bar>; rel="next"');
    expect(deets.next).toBe("/foo/bar");

    expect(() => adb.parseLinkHeader('rel="next"')).toThrow("link text");
})
