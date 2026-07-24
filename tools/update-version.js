/* globals process */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */

import {readFileSync, writeFileSync} from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const version = pkg.version;

const files = [
    "Hyphenopoly.js",
    "Hyphenopoly_Loader.js",
    "hyphenopoly.module.js"
];

const patterns = [
    /Hyphenopoly [\d.]+/,
    /Hyphenopoly_Loader [\d.]+/,
    /Hyphenopoly\.module\.js [\d.]+/
];

files.forEach((file, i) => {
    let content = readFileSync(file, "utf8");
    content = content.replace(patterns[i], (match) => {
        return match.replace(/[\d.]+/, version);
    });
    writeFileSync(file, content);
    process.stdout.write(`Updated ${file} to ${version}\n`);
});
