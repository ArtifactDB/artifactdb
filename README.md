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
// File artifacts we want to create, and their MD5 sums.
let paths = {
    "foo": "bf02365058a31ab56009204911985eff",
    "foo.json": "c202012c79bba039666e0935ef3b1e3b",
    "bar.txt": "ea5683e1344a7d7be76cceda6a9d5d4a",
    "bar.txt.json": "5e2008e26a1238b26a6d3b76b455684f",
    "whee/stuff.csv.gz": "a20def5b0ed444dad00b4d0479ff0ab3",
    "whee/stuff.csv.gz.json": "8894609bceb4f67cd98f25dd577ea37f"
};

// Initializing the upload.
let init = adb.initializeUpload(example_url, "test-zircon-upload", "my_test_version", paths, { expires: 1 });

// Uploading the files.
let contents = {
    "foo": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "foo.json": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "bar.txt": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "bar.txt.json": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "whee/stuff.csv.gz": "<CONTENTS AS A STRING OR ARRAYBUFFER>",
    "whee/stuff.csv.gz.json": "<CONTENTS AS A STRING OR ARRAYBUFFER>"
};
await adb.uploadFiles(example_url, init, contents);

// Completing the upload.
await adb.completeUpload(example_url, init);
```

The same code can be used to create new versions of an existing project.
In such cases, it is possible to use the output of `getProjectMetadata()` to identify the existing files in the latest version of the project,
and then pass them to `initializeUpload()` via the `dedupLinkPaths` argument.
This instructs the backend to create a link without an unnecessary roundtrip of pulling down and re-uploading that file's contents;
only the modified files need to be specified in `paths`.
