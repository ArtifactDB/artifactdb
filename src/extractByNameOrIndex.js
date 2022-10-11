/**
 * Given an array of objects with a name-like property, extract an entry by its name or index.
 *
 * @param {Array} x - An array of objects with a name-like property.
 * @param {string|index} index - The index or name of the entry of interest.
 * @param {object} [options={}] - Optional parameters.
 * @param {string} [options.name="name"] - Name of the name-like property across all objects in `x`.
 * @param {string} [options.context="array"] - Context of the array in `x`, used for error messages only.
 *
 * @return {object} The specified object in `x`.
 */
export function extractByNameOrIndex(x, index, { name = "name", context = "array" } = {}) {
    if (typeof index == "string") {
        for (var i = 0; i < x.length; i++) {
            if (x[i][name] == index) {
                return x[i];
            }
        }
        throw new Error("no entry named '" + name + "' in " + context);
    }

    if (index >= x.length || index < 0) {
        throw new Error("index " + String(index) + " is out of range for " + context);
    }

    return x[index];
}
