import * as https from "https";
import * as fs from "fs";
import * as os from "os";
import { sep } from "path";

async function request_to_file(url, file, failure) {
    let out = await(new Promise((resolve, reject) => {
        const req = https.get(url, response => {
            if (response.statusCode >= 400) {
                reject(new Error(failure + " (HTTP " + String(response.statusCode) + ")"));
                return;
            }

            if (response.statusCode >= 300) {
                resolve(response.headers.location);
                return;
            }

            response.pipe(file);
            file.on("finish", () => {
                file.close();
                resolve(null);
            });
        });

        req.on("error", function(err) {
            reject(err);
        });
    }));

    if (out !== null) {
        await request_to_file(out, file, failure);
    }
}

async function request_to_memory(url, data, failure) {
    let out = await (new Promise((resolve, reject) => {
        const req = https.get(url, response => {
            if (response.statusCode >= 400) {
                reject(new Error(failure + " (HTTP " + String(response.statusCode) + ")"));
                return;
            }

            if (response.statusCode >= 300) {
                resolve(response.headers.location);
                return;
            } 

            response.on("data", chunk => {
                data.push(chunk);
            });

            response.on("end", () => {
                resolve(null);
            });
        });

        req.on("error", function(err) {
            reject(err);
        });
    }));

    if (out !== null) {
        await request_to_memory(out, data, failure);
    }
}

async function dumpContents(target, cache, key, noCacheCallback, cacheCallback, failure) {
    if (cache == null) {
        let dump = [];
        await request_to_memory(target, dump, failure);
        return noCacheCallback(Buffer.concat(dump));
    }

    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache, { recursive: true });
    }

    if (key == null) {
        key = encodeURIComponent(url);
    }

    let candidate = cache + sep + key;
    if (fs.existsSync(candidate)) {
        return cacheCallback(candidate);
    }

    const file = fs.createWriteStream(candidate);
    try {
        await request_to_file(target, file, failure);
    } catch (e) {
        fs.unlinkSync(candidate);
        throw e;
    }

    return cacheCallback(candidate);
}

export async function getJson(url, { cache = null, key = null } = {}) {
    return await dumpContents(
        /* url = */ url, 
        /* cache = */ cache, 
        /* key = */ key, 
        /* noCacheCallback = */ 
            buffer => {
                return JSON.parse(buffer.toString());
            },
        /* cacheCallback = */ 
            candidate => {
                let buffer = fs.readFileSync(candidate, { encoding: 'utf8', flag: 'r' });
                return JSON.parse(buffer);
            },
        /* failure = */ "failed to fetch JSON from '" + url + "'"
    );
}

export async function getFile(url, { cache = null, key = null, forceBuffer = true } = {}) {
    return await dumpContents(
        /* url = */ url, 
        /* cache = */ cache, 
        /* key = */ key, 
        /* cacheCallback = */
            buffer => {
                return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
            },
        /* noCacheCallback = */
            candidate => {
                if (forceBuffer) {
                    let contents = fs.readFileSync(candidate);
                    return contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength);
                } else {
                    return candidate;
                }
            }, 
        /* failure = */ "failed to download file from '" + url + "'"
    );
}
