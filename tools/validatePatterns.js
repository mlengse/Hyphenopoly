/* eslint-env node */
/* eslint-disable no-console */

/**
 * Validation tool for Indonesian hyphenation patterns.
 *
 * Tests patterns against a wordlist and reports results.
 * Can be used to evaluate pattern improvements.
 *
 * Usage:
 * # node tools/validatePatterns.js
 * # node tools/validatePatterns.js --words "word1,word2,word3"
 * # node tools/validatePatterns.js --file wordlist.txt
 */

import {readFile} from "node:fs/promises";
import {dirname} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load Hyphenopoly and create hyphenator for Indonesian.
 * @returns {Promise<Function>} Indonesian hyphenator function
 */
async function createHyphenator() {
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const moduleUrl = pathToFileURL(`${baseDir}/../hyphenopoly.module.js`).href;
    const {"default": H9Y} = await import(moduleUrl);
    const loader = async (file) => {
        return readFile(`${baseDir}/../patterns/${file}`);
    };
    const hc = H9Y.config({
        loader,
        "hyphen": "|",
        "require": ["id"]
    });
    return hc.get("id");
}

/**
 * Parse CLI arguments.
 * @returns {object} Parsed arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        "file": null,
        "words": null,
        "verbose": false
    };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--file" && args[i + 1]) {
            result.file = args[i + 1];
            i += 1;
        } else if (args[i] === "--words" && args[i + 1]) {
            result.words = args[i + 1].split(",").map((w) => w.trim());
            i += 1;
        } else if (args[i] === "--verbose") {
            result.verbose = true;
        }
    }
    return result;
}

/**
 * Built-in test wordlist with expected hyphenations.
 * Format: [word, expected_hyphenation_with_pipe]
 */
const BUILTIN_WORDLIST = [
    // Kata dasar (base words)
    ["Indonesia", "In|do|ne|si|a"],
    ["Negara", "Ne|ga|ra"],
    ["pendidikan", "pen|di|dik|an"],
    ["teknologi", "tek|no|lo|gi"],
    ["terbesar", "ter|be|sar"],
    ["kepulauan", "ke|pu|lau|an"],

    // Kata berimbuhan (affixed words)
    ["mempelajari", "mem|pel|a|jar|i"],
    ["kependidikan", "ke|pen|di|dik|an"],
    ["pemerintahan", "pe|me|rin|tah|an"],
    ["pemerintah", "pe|me|rin|tah"],
    ["belajar", "bel|a|jar"],
    ["terjadi", "ter|ja|di"],
    ["pembelajaran", "pem|bel|a|jar|an"],
    ["kemerdekaan", "ke|mer|de|ka|an"],
    ["keindahan", "ke|in|dah|an"],
    ["pengembangan", "pe|ngem|bang|an"],
    ["perkembangan", "per|kem|bang|an"],
    ["pertumbuhan", "per|tum|buh|an"],
    ["kesehatan", "ke|se|hat|an"],
    ["pemanfaatan", "pe|man|fa|at|an"],
    ["menciptakan", "men|cip|ta|kan"],
    ["menata", "me|na|ta"],
    ["memilih", "me|mi|lih"],
    ["semaksimal", "se|mak|si|mal"],
    ["mungkin", "mung|kin"],
    ["kesenian", "ke|se|ni|an"],
    ["adalah", "a|da|lah"],
    ["tersedia", "ter|se|di|a"],
    ["teknik", "tek|nik"],
    ["membaca", "mem|ba|ca"],
    ["Tipografi", "Ti|po|gra|fi"],

    // Kata kerja (verb forms)
    ["makanan", "ma|kan|an"],
    ["minuman", "mi|num|an"],
    ["pekerjaan", "pe|ker|ja|an"],
    ["kegiatan", "ke|gi|at|an"],
    ["penilaian", "pe|ni|lai|an"],
    ["pemahaman", "pe|ma|ham|an"],
    ["penggunaan", "peng|gu|na|an"],
    ["penyuluhan", "pe|nyu|luh|an"],
    ["perlawanan", "per|la|wan|an"],
    ["penangkaran", "pe|nang|kar|an"],
    ["pembangunan", "pem|ba|ngun|an"],
    ["perhitungan", "per|hi|tung|an"],
    ["penyelesaian", "pe|nye|le|sai|an"],

    // Short words (below minWordLength=6, no hyphenation)
    ["Seni", "Seni"],
    ["cetak", "cetak"],
    ["huruf", "huruf"],
    ["tata", "tata"],
    ["yang", "yang"],
    ["kin", "kin"],

    // Multi-word
    ["Indonesia adalah negara", "In|do|ne|si|a a|da|lah ne|ga|ra"],
    ["Tipografi adalah", "Ti|po|gra|fi a|da|lah"],
];

/**
 * Validate hyphenator against wordlist.
 * @param {Function} hyphenator - Hyphenator function
 * @param {Array} wordlist - Array of [word, expected] tuples
 * @param {boolean} verbose - Print detailed output
 * @returns {object} Results summary
 */
function validate(hyphenator, wordlist, verbose) {
    const results = {
        "fail": [],
        "pass": 0,
        "total": wordlist.length
    };

    wordlist.forEach(([word, expected]) => {
        const actual = hyphenator(word);
        if (actual === expected) {
            results.pass += 1;
        } else {
            results.fail.push({actual, expected, word});
            if (verbose) {
                console.log(`FAIL: ${word}`);
                console.log(`  expected: ${expected}`);
                console.log(`  actual:   ${actual}`);
            }
        }
    });

    return results;
}

/**
 * Load wordlist from file (one word per line, tab-separated word/expected).
 * @param {string} filepath - Path to wordlist file
 * @returns {Promise<Array>} Wordlist array
 */
async function loadWordlistFile(filepath) {
    const content = await readFile(filepath, "utf8");
    return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
            const parts = line.split("\t");
            if (parts.length === 2) {
                return [parts[0], parts[1]];
            }
            return [parts[0], parts[0]];
        });
}

async function main() {
    const args = parseArgs();
    const hyphenator = await createHyphenator();

    let wordlist;
    if (args.file) {
        wordlist = await loadWordlistFile(args.file);
        console.log(`Loaded ${wordlist.length} words from ${args.file}`);
    } else if (args.words) {
        wordlist = args.words.map((w) => [w, null]);
        console.log(`Testing ${wordlist.length} words (no expected values, dry-run)`);
    } else {
        wordlist = BUILTIN_WORDLIST;
        console.log(`Using built-in wordlist (${wordlist.length} words)`);
    }

    console.log("---");

    if (args.words && !wordlist[0][1]) {
        // Dry-run mode: just show hyphenation results
        wordlist.forEach(([word]) => {
            console.log(`${word} -> ${hyphenator(word)}`);
        });
        return;
    }

    const results = validate(hyphenator, wordlist, args.verbose);

    console.log(`Pass: ${results.pass}/${results.total}`);
    console.log(`Fail: ${results.fail.length}/${results.total}`);

    if (results.fail.length > 0 && !args.verbose) {
        console.log("\nFailed words:");
        results.fail.forEach(({actual, expected, word}) => {
            console.log(`  ${word}: expected "${expected}" got "${actual}"`);
        });
    }

    // Pattern stats
    console.log("\n--- Pattern Analysis ---");
    const patFile = await readFile(`${__dirname}/../lang/id/src/hyph-id.pat.txt`, "utf8");
    const patterns = patFile.trim().split("\n").map((p) => p.trim());
    console.log(`Total patterns: ${patterns.length}`);

    const consonantPatterns = patterns.filter((p) => /^\d[a-z]\d[a-z]$/.test(p));
    const vowelPatterns = patterns.filter((p) => /^[aeiou]\d/.test(p));
    const otherPatterns = patterns.filter(
        (p) => !/^\d[a-z]\d[a-z]$/.test(p) && !/^[aeiou]\d/.test(p)
    );

    console.log(`Consonant-cluster patterns (2X1Y): ${consonantPatterns.length}`);
    console.log(`Vowel-initial patterns (v1...): ${vowelPatterns.length}`);
    console.log(`Other patterns: ${otherPatterns.length}`);

    // Show unique pattern prefixes
    const prefixes = new Map();
    patterns.forEach((p) => {
        const prefix = p.replace(/\d/g, "").slice(0, 2);
        prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1);
    });
    console.log("\nPattern character pairs (top 10):");
    const sorted = [...prefixes.entries()].sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 10).forEach(([k, v]) => {
        console.log(`  "${k}": ${v} patterns`);
    });

    process.exit(results.fail.length > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
