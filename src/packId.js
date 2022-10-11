/**
 * Create an ArtifactDB resource ID from its components.
 *
 * @param {string} project - Name of the project.
 * This should not contain `":"`.
 * @param {string} path - Path to the resource inside the project.
 * @param {string|number} version - Version of the project.
 * This should not contain `"@"`.
 *
 * @return {string} A full ArtifactDB identifier for the resource.
 */
export function packId(project, path, version) {
    return project + ":" + path + "@" + String(version);
}

/**
 * Split an AritfactDB resource ID into its components.
 *
 * @param {string} id - The full ArtifactDB identifier for a resource.
 * This should follow the format of `<PROJECT>:<PATH>@<VERSION>`,
 * where `<PROJECT>` should not contain `:` and `<VERSION>` should not contain `@`.
 *
 * @return {object} Object containing `project`, `path` and `version` strings - see {@linkcode packId} for details.
 */
export function unpackId(id) {
    let i1 = id.indexOf(":");
    if (i1 < 0) {
        throw new Error("could not identify project from 'id'");
    } else if (i1 == 0) {
        throw new Error("'id' should not have an empty project");
    }

    let i2 = id.lastIndexOf("@");
    if (i2 < 0) {
        throw new Error("could not identify version from 'id'");
    } else if (i2 == id.length - 1) {
        throw new Error("'id' should not have an empty version");
    }

    if (i2 < i1) {
        throw new Error("could not identify version from 'id'");
    } else if (i1 +1 == i2){
        throw new Error("'id' should not have an empty path");
    }

    return {
        project: id.slice(0, i1),
        path: id.slice(i1+1, i2),
        version: id.slice(i2+1)
    };
}
