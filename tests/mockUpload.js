import * as crypto from "crypto";

// Mimic the file structure.
export const contents = {
    "Aaron.txt": "My name is Aaron Lun.",
    "Jayaram.txt": "My name is Jayaram Kancherla. But my real name is Jaya Ram. Don't tell USCIS!",
    "Sebastien.txt": "Je suis une pizza."
};

for (const [k, v] of Object.entries(contents)) {
    let obj = { "$schema": "generic_file/v1.json", "generic_file": { format: "text" } };
    obj.path = k;
    const enc = new TextEncoder;
    obj.md5sum = crypto.createHash("md5").update(v).digest("hex");
    contents[k + ".json"] = JSON.stringify(obj);
}
