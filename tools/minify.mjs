import {execSync} from "node:child_process";
import {mkdirSync, cpSync, statSync} from "node:fs";

function fileSize(path) {
    try {
        return statSync(path).size;
    } catch {
        return 0;
    }
}

console.log("old sizes:");
console.log(`${fileSize("min/Hyphenopoly_Loader.js")} min/Hyphenopoly_Loader.js`);
console.log(`${fileSize("min/Hyphenopoly.js")} min/Hyphenopoly.js`);

mkdirSync("min", {recursive: true});

execSync("npx terser Hyphenopoly_Loader.js -o min/Hyphenopoly_Loader.js --comments -c passes=3,unsafe -m --warn", {stdio: "inherit"});
execSync("npx terser Hyphenopoly.js -o min/Hyphenopoly.js --comments -c passes=3,unsafe -m --warn", {stdio: "inherit"});

console.log("new sizes:");
console.log(`${fileSize("min/Hyphenopoly_Loader.js")} min/Hyphenopoly_Loader.js`);
console.log(`${fileSize("min/Hyphenopoly.js")} min/Hyphenopoly.js`);

cpSync("patterns", "min/patterns", {recursive: true});
cpSync("testsuite", "min/testsuite", {recursive: true});
