/* eslint func-names: 0 */
/* eslint-disable prefer-arrow-callback */

import t from "tap";

/**
 * Imports and returns the defaults of the hyphenopoly module.
 * Circumvents module caching by appending a query to the URL
 * LEAKS MEMORY!
 * @returns {object} Hyphenopoly module
 */
async function freshImport() {
    const {"default": H9Y} = await import(`../hyphenopoly.module.js?update=${Date.now()}`);
    return H9Y;
}

// eslint-disable-next-line jsdoc/require-jsdoc
async function loader(file) {
    const {readFile} = await import("node:fs/promises");
    const {dirname} = await import("node:path");
    const {fileURLToPath} = await import("node:url");
    const cwd = dirname(fileURLToPath(import.meta.url));
    return readFile(`${cwd}/../patterns/${file}`);
}

t.test("run config with Indonesian language", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("return a function", function (t) {
        t.equal(typeof idHyphenator, "function", typeof idHyphenator);
        t.end();
    });
    t.test("hyphenate one word: Tipografi", function (t) {
        t.equal(idHyphenator("Tipografi"), "Ti\u00ADpo\u00ADgra\u00ADfi", idHyphenator("Tipografi"));
        t.end();
    });
    t.test("hyphenate one word: adalah", function (t) {
        t.equal(idHyphenator("adalah"), "a\u00ADda\u00ADlah", idHyphenator("adalah"));
        t.end();
    });
    t.test("hyphenate one word: kesenian", function (t) {
        t.equal(idHyphenator("kesenian"), "ke\u00ADse\u00ADni\u00ADan", idHyphenator("kesenian"));
        t.end();
    });
    t.test("hyphenate one word: teknik", function (t) {
        t.equal(idHyphenator("teknik"), "tek\u00ADnik", idHyphenator("teknik"));
        t.end();
    });
    t.test("hyphenate one word: memilih", function (t) {
        t.equal(idHyphenator("memilih"), "me\u00ADmi\u00ADlih", idHyphenator("memilih"));
        t.end();
    });
    t.test("hyphenate one word: dengan", function (t) {
        t.equal(idHyphenator("dengan"), "de\u00ADngan", idHyphenator("dengan"));
        t.end();
    });
    t.test("hyphenate one word: pengaturan", function (t) {
        t.equal(idHyphenator("pengaturan"), "peng\u00ADa\u00ADtur\u00ADan", idHyphenator("pengaturan"));
        t.end();
    });
    t.test("hyphenate one word: tersedia", function (t) {
        t.equal(idHyphenator("tersedia"), "ter\u00ADse\u00ADdi\u00ADa", idHyphenator("tersedia"));
        t.end();
    });
    t.test("hyphenate one word: menciptakan", function (t) {
        t.equal(idHyphenator("menciptakan"), "men\u00ADcip\u00ADta\u00ADkan", idHyphenator("menciptakan"));
        t.end();
    });
    t.test("hyphenate one word: membaca", function (t) {
        t.equal(idHyphenator("membaca"), "mem\u00ADba\u00ADca", idHyphenator("membaca"));
        t.end();
    });
    t.test("hyphenate one word: semaksimal", function (t) {
        t.equal(idHyphenator("semaksimal"), "se\u00ADmak\u00ADsi\u00ADmal", idHyphenator("semaksimal"));
        t.end();
    });
    t.test("hyphenate one word: mungkin", function (t) {
        t.equal(idHyphenator("mungkin"), "mung\u00ADkin", idHyphenator("mungkin"));
        t.end();
    });
    t.test("hyphenate two words", function (t) {
        t.equal(idHyphenator("Tipografi adalah"), "Ti\u00ADpo\u00ADgra\u00ADfi a\u00ADda\u00ADlah", idHyphenator("Tipografi adalah"));
        t.end();
    });
    t.end();
});

t.test("Indonesian kata dasar (base words)", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("hyphenate Indonesia", function (t) {
        t.equal(idHyphenator("Indonesia"), "In\u00ADdo\u00ADne\u00ADsi\u00ADa", idHyphenator("Indonesia"));
        t.end();
    });
    t.test("hyphenate pendidikan", function (t) {
        t.equal(idHyphenator("pendidikan"), "pen\u00ADdi\u00ADdik\u00ADan", idHyphenator("pendidikan"));
        t.end();
    });
    t.test("hyphenate teknologi", function (t) {
        t.equal(idHyphenator("teknologi"), "tek\u00ADno\u00ADlo\u00ADgi", idHyphenator("teknologi"));
        t.end();
    });
    t.test("hyphenate Negara", function (t) {
        t.equal(idHyphenator("Negara"), "Ne\u00ADga\u00ADra", idHyphenator("Negara"));
        t.end();
    });
    t.test("hyphenate terbesar", function (t) {
        t.equal(idHyphenator("terbesar"), "ter\u00ADbe\u00ADsar", idHyphenator("terbesar"));
        t.end();
    });
    t.end();
});

t.test("Indonesian kata berimbuhan (affixed words)", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("hyphenate mempelajari", function (t) {
        t.equal(idHyphenator("mempelajari"), "mem\u00ADpel\u00ADa\u00ADjar\u00ADi", idHyphenator("mempelajari"));
        t.end();
    });
    t.test("hyphenate kependidikan", function (t) {
        t.equal(idHyphenator("kependidikan"), "ke\u00ADpen\u00ADdi\u00ADdik\u00ADan", idHyphenator("kependidikan"));
        t.end();
    });
    t.test("hyphenate pemerintahan", function (t) {
        t.equal(idHyphenator("pemerintahan"), "pe\u00ADme\u00ADrin\u00ADtah\u00ADan", idHyphenator("pemerintahan"));
        t.end();
    });
    t.test("hyphenate belajar", function (t) {
        t.equal(idHyphenator("belajar"), "bel\u00ADa\u00ADjar", idHyphenator("belajar"));
        t.end();
    });
    t.test("hyphenate terjadi", function (t) {
        t.equal(idHyphenator("terjadi"), "ter\u00ADja\u00ADdi", idHyphenator("terjadi"));
        t.end();
    });
    t.test("hyphenate pemerintah", function (t) {
        t.equal(idHyphenator("pemerintah"), "pe\u00ADme\u00ADrin\u00ADtah", idHyphenator("pemerintah"));
        t.end();
    });
    t.test("hyphenate pembelajaran", function (t) {
        t.equal(idHyphenator("pembelajaran"), "pem\u00ADbel\u00ADa\u00ADjar\u00ADan", idHyphenator("pembelajaran"));
        t.end();
    });
    t.test("hyphenate kemerdekaan", function (t) {
        t.equal(idHyphenator("kemerdekaan"), "ke\u00ADmer\u00ADde\u00ADka\u00ADan", idHyphenator("kemerdekaan"));
        t.end();
    });
    t.test("hyphenate keindahan", function (t) {
        t.equal(idHyphenator("keindahan"), "ke\u00ADin\u00ADdah\u00ADan", idHyphenator("keindahan"));
        t.end();
    });
    t.test("hyphenate pengembangan", function (t) {
        t.equal(idHyphenator("pengembangan"), "pe\u00ADngem\u00ADbang\u00ADan", idHyphenator("pengembangan"));
        t.end();
    });
    t.test("hyphenate perkembangan", function (t) {
        t.equal(idHyphenator("perkembangan"), "per\u00ADkem\u00ADbang\u00ADan", idHyphenator("perkembangan"));
        t.end();
    });
    t.test("hyphenate pertumbuhan", function (t) {
        t.equal(idHyphenator("pertumbuhan"), "per\u00ADtum\u00ADbuh\u00ADan", idHyphenator("pertumbuhan"));
        t.end();
    });
    t.test("hyphenate kesehatan", function (t) {
        t.equal(idHyphenator("kesehatan"), "ke\u00ADse\u00ADhat\u00ADan", idHyphenator("kesehatan"));
        t.end();
    });
    t.end();
});

t.test("Indonesian kata majemuk (compound words with hyphen)", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("hyphenate kereta-api", function (t) {
        t.equal(idHyphenator("kereta-api"), "kereta-\u200Bapi", idHyphenator("kereta-api"));
        t.end();
    });
    t.test("hyphenate rumah-sakit", function (t) {
        t.equal(idHyphenator("rumah-sakit"), "rumah-\u200Bsakit", idHyphenator("rumah-sakit"));
        t.end();
    });
    t.end();
});

t.test("Indonesian full paragraph from testsuite", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        "hyphen": "|",
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("hyphenate full paragraph", function (t) {
        const text = "Tipografi, seni cetak atau tata huruf adalah suatu kesenian dan teknik memilih dan menata huruf dengan pengaturan penyebarannya pada ruang yang tersedia, untuk menciptakan kesan tertentu, guna kenyamanan membaca semaksimal mungkin.";
        const expected = "Ti|po|gra|fi, seni cetak atau tata huruf a|da|lah suatu ke|se|ni|an dan tek|nik me|mi|lih dan me|na|ta huruf de|ngan peng|a|tur|an pe|nye|bar|an|nya pada ruang yang ter|se|di|a, untuk men|cip|ta|kan kesan ter|ten|tu, guna ke|nya|man|an mem|ba|ca se|mak|si|mal mung|kin.";
        t.equal(idHyphenator(text), expected, idHyphenator(text));
        t.end();
    });
    t.end();
});

t.test("Indonesian edge cases", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("short word: Seni (5 chars, below default minWordLength 6)", function (t) {
        t.equal(idHyphenator("Seni"), "Seni", idHyphenator("Seni"));
        t.end();
    });
    t.test("short word: cetak (5 chars)", function (t) {
        t.equal(idHyphenator("cetak"), "cetak", idHyphenator("cetak"));
        t.end();
    });
    t.test("short word: tata (4 chars)", function (t) {
        t.equal(idHyphenator("tata"), "tata", idHyphenator("tata"));
        t.end();
    });
    t.test("short word: huruf (5 chars)", function (t) {
        t.equal(idHyphenator("huruf"), "huruf", idHyphenator("huruf"));
        t.end();
    });
    t.test("short word: yang (4 chars)", function (t) {
        t.equal(idHyphenator("yang"), "yang", idHyphenator("yang"));
        t.end();
    });
    t.test("short word: kin (3 chars)", function (t) {
        t.equal(idHyphenator("kin"), "kin", idHyphenator("kin"));
        t.end();
    });
    t.test("empty string", function (t) {
        t.equal(idHyphenator(""), "", idHyphenator(""));
        t.end();
    });
    t.end();
});

t.test("Indonesian: set minWordLength", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        "hyphen": "|",
        loader,
        "minWordLength": 4,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("short word with minWordLength 4: Seni", function (t) {
        t.equal(idHyphenator("Seni"), "Se|ni", idHyphenator("Seni"));
        t.end();
    });
    t.test("short word with minWordLength 4: tata", function (t) {
        t.equal(idHyphenator("tata"), "ta|ta", idHyphenator("tata"));
        t.end();
    });
    t.end();
});

t.test("Indonesian: set custom hyphen character", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        "hyphen": "\u00B7",
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("hyphenate with middle dot", function (t) {
        t.equal(idHyphenator("teknologi"), "tek\u00B7no\u00B7lo\u00B7gi", idHyphenator("teknologi"));
        t.end();
    });
    t.end();
});

t.test("Indonesian: leftmin and rightmin", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        "hyphen": "|",
        "leftmin": 4,
        loader,
        "require": ["id"],
        "rightmin": 4
    });
    const idHyphenator = await hc.get("id");
    t.test("apply leftmin: pendidikan", function (t) {
        t.equal(idHyphenator("pendidikan"), "pendi|dikan", idHyphenator("pendidikan"));
        t.end();
    });
    t.test("apply leftmin: teknologi", function (t) {
        t.equal(idHyphenator("teknologi"), "tekno|logi", idHyphenator("teknologi"));
        t.end();
    });
    t.end();
});

t.test("Indonesian: special characters", async function (t) {
    const H9Y = await freshImport();
    const hc = H9Y.config({
        loader,
        "require": ["id"]
    });
    const idHyphenator = await hc.get("id");
    t.test("kata dengan angka: RT01/RW02", function (t) {
        t.equal(idHyphenator("RT01/RW02"), "RT01/RW02", idHyphenator("RT01/RW02"));
        t.end();
    });
    t.test("kata dengan angka: 12345", function (t) {
        t.equal(idHyphenator("12345"), "12345", idHyphenator("12345"));
        t.end();
    });
    t.test("kata dengan angka: UUD1945", function (t) {
        t.equal(idHyphenator("UUD1945"), "UUD1945", idHyphenator("UUD1945"));
        t.end();
    });
    t.test("singkatan: dll.", function (t) {
        t.equal(idHyphenator("dll."), "dll.", idHyphenator("dll."));
        t.end();
    });
    t.test("singkatan: dst.", function (t) {
        t.equal(idHyphenator("dst."), "dst.", idHyphenator("dst."));
        t.end();
    });
    t.test("kata dengan tanda seru: hebat!", function (t) {
        t.equal(idHyphenator("hebat!"), "hebat!", idHyphenator("hebat!"));
        t.end();
    });
    t.test("kata dengan tanda tanya: apa?", function (t) {
        t.equal(idHyphenator("apa?"), "apa?", idHyphenator("apa?"));
        t.end();
    });
    t.end();
});
