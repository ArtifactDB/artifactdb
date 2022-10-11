import * as adb from "../src/index.js";

test("extracting by name or index works as expected", () => {
    let obj = [ { name: "bar", value: 1 }, { name: "foo", value: 0 }];

    let out = adb.extractByNameOrIndex(obj, 0);
    expect(out.name).toBe("bar");
    expect(out.value).toBe(1);

    out = adb.extractByNameOrIndex(obj, "foo");
    expect(out.name).toBe("foo");
    expect(out.value).toBe(0);

    expect(() => adb.extractByNameOrIndex(obj, "whee")).toThrow("no entry named 'whee'");
    expect(() => adb.extractByNameOrIndex(obj, 3)).toThrow("out of range");
})

