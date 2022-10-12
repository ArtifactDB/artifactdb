# Javascript API for ArtifactDB

## Overview

This package implements a Javascript client for ArtifactDB instances, equivalent to the [**zircon**](https://github.com/ArtifactDB/zircon-R) client for R.
It provides the usual helper functions to pull individual files and metadata, project-level information or permissions.
It also provides methods to upload new versions to the ArtifactDB backend, given the appropriate authorization.
The general aim is to enable the use of ArtifactDB in Javascript-based web applications, though the same code works in Node.js environments as well.

## Quick start

Install this package from NPM:

```sh
npm install whoople
```

We'll use the test [**gypsum**](https://github.com/ArtifactDB/gypsum-worker) instance to run our examples.
**whoople** uses ES6 syntax, so:

```js
import * as adb from "whoople";

let example_url = "https://gypsum-test.aaron-lun.workers.dev";

// Fetch metadata for a file:
let meta = await adb.getFileMetadata(example_url, "test-zircon-upload:blah.txt@base");

// Fetch the file contents (defaulting to ArrayBuffer):
let contents = await adb.getFile(example_url, "test-zircon-upload:blah.txt@base");

// Fetch all files for a given project's version:
let project_meta = await adb.getProjectMetadata(example_url, "test-zircon-upload", { version: "base" });

// See the project permissions:
let project_perm = await adb.getPermissions(example_url, "test-zircon-upload");

// List available versions:
let project_versions = await adb.listProjectVersions(example_url, "test-zircon-upload");
```

Check out the [reference documentation](https://artifactdb.github.io/whoople) for more details.

## Using a different request function

By default, we use the web API's `fetch()` to do all requests.
Users can adjust the `globalRequestHeaders` to add headers to each request, typically for authentication:

```js
adb.globalRequestHeaders["Authorization"] = "Bearer " + token;

// Now we can access non-public resources for the user's token:
let contents = await adb.getFile(example_url, some_non_public_file);
```

Users can also override the request function directly by supplying their own function that returns a `Response` object. 
This may be useful for older versions of Node.js where the `fetch()` function may not be available (and a polyfill is not appropriate, for whatever reason).

```js
import * as https from "https";

async function newGet(url) {
    /* Some implementation based on https.get() */
}

let contents = await adb.getFile(example_url, some_non_public_file, { getFun: newGet });
```

## Uploading to ArtifactDB

Authorized users can also upload projects to ArtifactDB.

```js
// Defining the files inside our project.
let contents = {
    "foo": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "foo.json": "<JSON METADATA AS A STRING OR ARRAYBUFFER>",
    "bar.txt": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "bar.txt.json": "<JSON METADATA AS A STRING OR ARRAYBUFFER>",
    "whee/stuff.csv.gz": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "whee/stuff.csv.gz.json": "<JSON METADATA AS A STRING OR ARRAYBUFFER>"
};

// Computing their checksums.
import * as hash from "hash-wasm";
let checksums = {};
for (const [k, v] of Object.entries(contents)) {
    checksums[k] = await hash.md5(v);
}

// Performing the upload. For test projects, we'll set a 1-day expiry.
await adb.uploadProject(
    example_url, 
    "test-zircon-upload", 
    "my_test_version", 
    checksums, 
    contents, 
    { initArgs: { expires: 1 } }
);
```

A similar code chunk can be used to create new versions of an existing project, without downloading the existing contents.

```js
import * as hash from "hash-wasm";
let existing = getProjectMetadata(example_url, "test-zircon-upload", "base");

let contents = {};
let checksums = {};
let links = {};
for (const x of existing.metadata) {
    if (x.path.endsWith(".json")) {
        let basic = { ...x };
        delete basic._extra;
        contents[x.path] = JSON.stringify(basic);
        checksums[x.path] = await hash.md5(contents[x.path]);
    } else {
        links[x.path] = x["_extra"]["id"];
    }
}

// Initializing the upload, creating links where possible.
await adb.uploadProject(
    example_url, 
    "test-zircon-upload", 
    "my_test_version", 
    checksums, 
    contents, 
    { initArgs: { dedupLinkPaths: links, expires: 1 } }
);
```
