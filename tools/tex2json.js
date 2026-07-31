/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-env node */

/**
 * Convert from TeX pattern format to JSON for simpler usage in other scripts.
 *
 * Input:
 * hyph-<lang>.chr.txt - A list of chars used in the specified language
 * hyph-<lang>.hyp.txt - A list of exceptions for the language
 * hyph-<lang>.lic.txt - The licence of the pattern file
 * hyph-<lang>.pat.txt - The hyphenation patterns for the language
 *
 * Output:
 * A JSON file named '<outname>.json' of the following form:
 * {
 *     "chr": <array of strings>,
 *     "hyp": <array of strings>
 *     "lic": <string>,
 *     "lrmin": <array of ints>
 *     "pat": <array of arrays> where each subarray is [pattern, chars, digits]
 * }
 *
 * Usage:
 * # node tex2json.js chr.txt hyp.txt lic.txt pat.txt outname
 */

import fs from "fs";
const chrFileContent = fs.readFileSync(process.argv[2], "utf8").trim();
const hypFileContent = fs.readFileSync(process.argv[3], "utf8").trim();
const licFileContent = fs.readFileSync(process.argv[4], "utf8").trim();
const patFileContent = fs.readFileSync(process.argv[5], "utf8").trim();

const parsedData = {
    "chr": [],
    "lic": licFileContent,
    "lrmin": [2, 2],
    "pat": []
};

const chrFileLines = chrFileContent.split("\n");
const subst = [];
chrFileLines.forEach((line) => {
    if (line.length === 1) {
        line += "_";
    } else if (line.length > 2) {
        subst.push(line.charAt(0) + line.slice(2));
        line = line.slice(0, 2);
    }
    parsedData.chr.push(line);
});
parsedData.chr.push(...subst);

const patFileLines = patFileContent.split("\n");

const hypFileLines = hypFileContent.split("\n");
hypFileLines.forEach((line) => {
    if (line !== "") {
        const convertedHyp = ["."];
        const lineChars = line.split("");
        let lastWasHyp = false;
        // Exceptions are encoded with the highest pattern weights so they
        // override any conflicting learned pattern (patgen weights go up to 9):
        // "10" = no break here, "11" = break here.
        lineChars.forEach((c) => {
            if (c === "-") {
                convertedHyp.push("11");
                lastWasHyp = true;
            } else if (lastWasHyp) {
                convertedHyp.push(c);
                lastWasHyp = false;
            } else {
                convertedHyp.push("10", c);
                lastWasHyp = false;
            }
        });
        convertedHyp.push("10", ".");
        patFileLines.push(convertedHyp.join(""));
    }
});

patFileLines.forEach((line) => {
    const hasAlpha = /\D/;
    if (hasAlpha.test(line)) {
        // It's a pattern
        const len = line.length;
        let pos = 0;
        const chars = [];
        const digits = [];
        let prevWasChar = true;
        while (pos < len) {
            const cc = line.charCodeAt(pos);
            if (cc <= 57 && cc >= 49) {
                // It's a digit
                const nc = line.charCodeAt(pos + 1);
                if (nc === 48 || nc === 49) {
                    // Two-digit value ("10" or "11", only used for exceptions)
                    digits.push((cc - 48) * 10 + (nc - 48));
                    pos += 2;
                } else {
                    digits.push(cc - 48);
                    pos += 1;
                }
                prevWasChar = false;
            } else {
                // It's a character
                chars.push(cc);
                if (prevWasChar) {
                    digits.push(0);
                }
                prevWasChar = true;
                pos += 1;
            }
        }
        parsedData.pat.push([line, chars, digits]);
    } else {
        // Leftmin and rightmin
        const nums = line.split("");
        parsedData.lrmin[0] = parseInt(nums[0], 10);
        parsedData.lrmin[1] = parseInt(nums[1], 10);
    }
});

fs.writeFileSync(process.argv[6] + ".json", JSON.stringify(parsedData, null, 4));
