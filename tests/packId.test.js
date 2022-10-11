import * as adb from "../src/index.js";

test("packing and unpacking work as expected", () => {
    let packed = adb.packId("GPA2", "foo", "v1");
    expect(packed).toBe("GPA2:foo@v1");

    let unpacked = adb.unpackId(packed);
    expect(unpacked.project).toBe("GPA2");
    expect(unpacked.path).toBe("foo");
    expect(unpacked.version).toBe("v1");

    expect(() => adb.unpackId("asdasd@1")).toThrow("could not identify");
    expect(() => adb.unpackId("asdasd:1")).toThrow("could not identify");
    expect(() => adb.unpackId("as@dasd:asdasd")).toThrow("could not identify");

    expect(() => adb.unpackId(":asdasd@1")).toThrow("empty project");
    expect(() => adb.unpackId("asdasd:asdasd@")).toThrow("empty version");
    expect(() => adb.unpackId("as:@foo")).toThrow("empty path");
})
