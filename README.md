# Javascript API for ArtifactDB

This package provides a bare-bones Javascript client for ArtifactDB instances.
It defines a `Resource` base class to represent a single ArtifactDB resource, from which users can download metadata as well as the file itself.
It is unlikely that developers will need to use this directly - unless, of course, they are creating an interface for a specific instance such as **DataSetDB** or **ResultsDB**.

To install this package, fetch it from our internal [NPM registry](http://npm.vida.science.roche.com):

```sh
# Set the registry
npm config set registry http://npm.vida.science.roche.com

# install the package
npm i artifactdb.js
```

Interface developers should define a subclass of `Resource` for their specific ArtifactDB instance.
This should include the `downloadFile` and `getMetadata` static methods to fetch data from the ArtifactDB REST API, possibly with caching and/or authentication.
For example, for ResultsDB, we might use:

```js
import * as adb from "artifactdb.js";

class ResultResource extends adb.Resource {
    constructor(project, path, id) {
        super(project, path, id);
    }

    // Omitting error checks for simplicity here.
    static getMetadata(id) {
        let res = await fetch("https://resultsdb.genomics.roche.com/v3/" + encodeURIComponent(id) + "/metadata");
        return res.json(); 
    }

    static downloadFile(id, { forceBuffer = false } = {}) {
        let res = await fetch("https://resultsdb.genomics.roche.com/v3/" + encodeURIComponent(id));
        return res.arrayBuffer(); 
    }
}
```

Application developers can then do something like:

```js
let res = new ResultResource("GPA2", "voom-results/all.results-1", "PUBLISHED-5");
let meta = await res.metadata;
let contents = await res.download();
```

Check out the [reference documentation](https://vida.pages.roche.com/artifactdb.js) for more details.
