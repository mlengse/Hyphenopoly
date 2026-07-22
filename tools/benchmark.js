import {readFile} from "node:fs/promises";
import {performance} from "node:perf_hooks";
import hyphenopoly from "../hyphenopoly.module.js";

async function loader(file, patDir) {
    return readFile(new URL(file, patDir));
}

const words = [
    "Indonesia", "pendidikan", "teknologi", "Negara", "terbesar",
    "Tipografi", "adalah", "kesenian", "teknik", "memilih",
    "dengan", "pengaturan", "tersedia", "menciptakan", "membaca",
    "semaksimal", "mungkin", "mempelajari", "kependidikan", "pemerintahan",
    "belajar", "terjadi", "pemerintah", "pembelajaran", "kemerdekaan",
    "keindahan", "pengembangan", "perkembangan", "pertumbuhan", "kesehatan",
    "supercalifragilisticexpialidocious", "hyphenation", "algorithm",
    "internationally", "characteristic", "communication", "engineering",
    "professional", "extraordinary", "infrastructure", "constitutional",
    "Silbentrennung", "Geschwindigkeit", "Qualitätsverbesserung",
    "Elektrizitätsversorgung", "Wettbewerbsfähigkeit", "Donaudampfschifffahrt",
    "Wirtschaftswissenschaft", "Gemeinschaftskunde", "Rindfleischetikettierung",
    "Freundschaftsbezeihungen"
];

const langs = ["id", "en-us", "de"];
const ITERATIONS = 100;

async function bench(name, hyphenator, text) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        hyphenator(text);
    }
    const end = performance.now();
    return end - start;
}

async function main() {
    const config = {
        loader,
        require: langs
    };
    const hyphenators = new Map();
    const h = hyphenopoly.config(config);

    for (const lang of langs) {
        hyphenators.set(lang, await h.get(lang));
    }

    const text = words.join(" ");

    console.log("=== Benchmark: Hyphenation Performance ===");
    console.log(`Words: ${words.length} | Iterations: ${ITERATIONS}\n`);

    // Warmup
    for (const [lang, hyphenator] of hyphenators) {
        hyphenator(text);
    }

    // Benchmark per-language
    const results = {};
    for (const [lang, hyphenator] of hyphenators) {
        const time = await bench(lang, hyphenator, text);
        results[lang] = time;
        const opsPerSec = Math.round((ITERATIONS / (time / 1000)));
        console.log(`${lang.padEnd(8)}: ${time.toFixed(1).padStart(8)} ms total | ${opsPerSec} ops/sec | ${(time / ITERATIONS).toFixed(2)} ms/call`);
    }

    // Benchmark single words
    console.log("\n=== Single Word Benchmark (1000 iterations each) ===\n");
    const singleIters = 1000;
    for (const [lang, hyphenator] of hyphenators) {
        const start = performance.now();
        for (let i = 0; i < singleIters; i++) {
            for (const word of words) {
                hyphenator(word);
            }
        }
        const end = performance.now();
        const time = end - start;
        const totalWords = singleIters * words.length;
        const nsPerWord = Math.round((time / totalWords) * 1000);
        console.log(`${lang.padEnd(8)}: ${time.toFixed(1).padStart(8)} ms | ${(time / singleIters).toFixed(2)} ms/batch | ${nsPerWord} ns/word`);
    }

    // Pattern size comparison
    console.log("\n=== Pattern Size Comparison ===\n");
    const sizes = {};
    for (const lang of langs) {
        const file = await readFile(new URL(`../patterns/${lang}.wasm`, import.meta.url));
        sizes[lang] = file.length;
    }
    for (const lang of langs) {
        console.log(`${lang.padEnd(8)}: ${sizes[lang].toString().padStart(6)} bytes`);
    }
}

main().catch(console.error);
