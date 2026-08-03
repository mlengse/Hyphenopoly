# Spec Repositori Hyphenopoly (Fork Bahasa Indonesia)

## 1. Ringkasan

Repositori ini adalah **fork dari [Hyphenopoly.js](https://github.com/mlengse/Hyphenopoly)** (versi 6.1.0, upstream: `mnater/Hyphenopoly`) dengan tambahan **dukungan pemenggalan Bahasa Indonesia (id)**.

Hyphenopoly.js adalah:
- **Polyfill JavaScript** untuk hyphenation CSS di browser: memenggal teks jika user agent tidak mendukung `hyphens: auto` untuk bahasa yang diminta.
- **Modul Node.js** untuk memenggal string teks biasa.

Tambahan inti pada fork ini: pattern Bahasa Indonesia yang **dibangkitkan dari data KBBI 2025** (±72.000 kata terverifikasi), plus tooling validasi, dokumentasi (`docs/Indonesian.md`), dan test suite khusus (`test/indonesian.js`).

## 2. Struktur Repositori

```
├── Hyphenopoly_Loader.js      # Feature-detect + load resources di browser (~11KB)
├── Hyphenopoly.js             # DOM manipulation + wrap wasm di browser (~36KB)
├── hyphenopoly.module.js      # Modul Node.js (ESM) untuk hyphenate teks biasa
├── min/                       # Hasil minify (terser) untuk produksi
├── patterns/                  # 75 file *.wasm (pattern per bahasa, termasuk id.wasm)
├── lang/<kode-bahasa>/        # Sumber pattern per bahasa
│   └── id/
│       ├── id.wasm            # WASM ter-compile untuk Bahasa Indonesia
│       └── src/
│           ├── hyph-id.hyp.txt  # 6.915 kata terpenggal (data training/validasi)
│           ├── hyph-id.pat.txt  # 11.443 pattern (format Liang/patgen)
│           ├── hyph-id.lic.txt  # Lisensi pattern
│           ├── id.json          # Pattern ter-parse (chr, lic, lrmin, pat)
│           ├── id.data          # Data succinct trie hasil createWasmData.js
│           ├── g.ts             # Offset globals hasil createWasmData.js
│           ├── hyphenEngine.ts  # Copy engine AssemblyScript
│           ├── mytransform.js   # Transform untuk kompilasi assemblyscript
│           └── tsconfig.json
├── src/                       # Sumber engine AssemblyScript
│   ├── hyphenEngine.ts        # Inti algoritma hyphenation (succinct trie + wasm)
│   ├── g.ts                   # Offsets data (lm, rm, ao, as, bm, cm, hv, vm, va)
│   └── mytransform.js
├── tools/                     # Script build & utilitas
│   ├── createWasmData.js      # id.json -> id.data + g.ts (succinct trie)
│   ├── createWasmForLang.sh   # Build wasm per bahasa (assemblyscript)
│   ├── createAllWasm.sh       # Build semua bahasa
│   ├── tex2json.js            # Pattern TeX -> JSON
│   ├── extractTeXpatterns.js  # Ekstrak pattern dari tex-hyphen
│   ├── validatePatterns.js    # Validasi pattern id vs wordlist KBBI
│   ├── minify.mjs             # Minify (terser)
│   ├── searchHashSeeds.js     # Cari hash seed translate map
│   └── modules/               # bits.js, charData.js, sTrie.js, trie.js
├── test/                      # Test suite (tap)
│   └── indonesian.js          # Test khusus Bahasa Indonesia (349 baris)
├── testsuite/                 # Test suite browser
├── examples/                  # Contoh browser + node
├── docs/                      # Dokumentasi (termasuk Indonesian.md)
└── package.json
```

## 3. Arsitektur & Alur Kerja

### 3.1 Browser
1. `Hyphenopoly_Loader.js` di-load; `Hyphenopoly.config({require, setup})` dipanggil inline.
2. Loader melakukan feature-detection CSS `hyphens` untuk setiap bahasa di `require`.
3. Jika ada bahasa yang tidak didukung → sembunyikan dokumen, muat `Hyphenopoly.js` + modul wasm.
4. `Hyphenopoly.js` memenggal elemen pada selector yang dikonfigurasi, lalu menampilkan kembali dokumen.
5. Timeout pengaman (default 1000ms) memastikan dokumen tidak tersembunyi selamanya.

### 3.2 Node.js
1. `hyphenopoly.config({require, loader, hyphen, ...})` mengembalikan `hc`.
2. `await hc.get("id")` mengembalikan fungsi hyphenator untuk bahasa `id`.
3. Panggil `hyphenateText(text)` → string terpenggal dengan soft hyphen `\u00AD` (atau char kustom).

### 3.3 Inti Engine (AssemblyScript)
- `src/hyphenEngine.ts` dikompilasi per-bahasa menjadi wasm.
- Memori statis: word (0), translatedWord (128), hyphenPoints (192), originalWord (256), translateMap (384), alphabet (1664), lalu data pattern.
- Pattern tersimpan sebagai **succinct value trie** (STrieBits, STrieChars, hasValueBits, valuesBitMap, values).
- Translate map memetakan UTF-16 → int 8-bit (max 255 chars), dengan hash minimalis dan penanganan kolisi.
- Fungsi `hyphenate(lmin, rmin, hc)` menjalankan algoritma Liang: cari semua pattern yang merupakan substring → gabungkan nilai (nilai lebih besar menang) → nilai ganjil adalah titik hyphen (kecuali di luar `leftmin`/`rightmin`).

### 3.4 Pipeline Bahasa Indonesia (KBBI 2025)
```
Data pemenggalan KBBI (72.000+ kata)
        │
        ▼
hyph-id.hyp.txt  (6.915 kata terpenggal, format "a-ba-di")
        │  (generasi pattern via patgen/aturan fonotaktik)
        ▼
hyph-id.pat.txt  (11.443 pattern, format Liang: ".aba3h")
        │  tools/tex2json.js
        ▼
id.json  (chr, lic, lrmin [2,2], pat)
        │  node tools/createWasmData.js id.json id.data g.ts
        ▼
id.data + g.ts  (succinct trie + offset globals)
        │  asc (assemblyscript) via createWasmForLang.sh
        ▼
lang/id/id.wasm  (130 KB)
        │  tools/minify.mjs (terser)
        ▼
patterns/id.wasm  (130 KB) + min/patterns/id.wasm  (3,2 KB)
```

Karakter alphabet id: `a-z, A-Z` plus `ê/ü/é` (substitusi `_`). Nilai `lrmin = [2, 2]` (leftmin/rightmin default).

## 4. Konfigurasi

| Opsi | Lokasi | Default | Keterangan |
|------|--------|---------|------------|
| `require` | config | — | Bahasa yang wajib didukung (objek `{lang: "kata"}` di browser; array di node) |
| `setup.selectors` | browser | `.hyphenate` | Selector elemen yang dipenggal |
| `minWordLength` | config / selector | 6 | Kata lebih pendek tidak dipenggal |
| `leftmin` / `rightmin` | config / selector | dari data (`id`: 2) | Karakter minimal sebelum/sesudah titik hyphen pertama/terakhir |
| `hyphen` | config | `\u00AD` | Karakter hyphen (mis. `"·"`, `"|"`) |
| `exceptions` | config | — | Daftar pengecualian per bahasa (mis. `{"en-us": "en-han-ces"}`) |
| `loader` | node | — | Fungsi async untuk membaca file pattern/wasm |
| `FORCEHYPHENOPOLY` | browser | — | Nilai `require` untuk memaksa pemakaian polyfill (testing) |

## 5. Testing

- Framework: **tap** (`c8 tap --disable-coverage --allow-empty-coverage test/*.js`), lint via eslint + remark di `pretest`.
- `test/indonesian.js` mencakup:
  - Kata dasar (Indonesia, pendidikan, teknologi, ...)
  - Kata berimbuhan (mempelajari, pemerintahan, kemerdekaan, ...)
  - Kata majemuk dengan hyphen (kereta-api, rumah-sakit)
  - Paragraf penuh dari testsuite
  - Edge case: kata pendek, string kosong, angka (RT01/RW02, UUD1945), singkatan (dll., dst.), tanda baca (!, ?)
  - Override `minWordLength`, custom hyphen, `leftmin`/`rightmin`
- Validasi manual: `node tools/validatePatterns.js` (built-in wordlist, `--words`, `--file`, `--verbose`).

## 6. Batasan yang Diketahui

1. Kata < 6 karakter tidak dipenggal (default; bisa diubah via `minWordLength`).
2. Kata majemuk bertanda hubung (kereta-api) mempertahankan hyphen asli tanpa menambah titik pemenggalan di tiap komponen.
3. Alphabet terbatas Latin (a-z, A-Z) + `ê/ü/é`; angka/simbol lain tidak dipenggal.
4. Pattern berbasis KBBI 2025 — kata sangat baru/informal bisa tidak optimal.
5. `translateMap` membatasi alphabet ≤ 255 karakter per bahasa (hash collision → fallback linear).

## 7. Akurasi vs KBBI Ground Truth

- Sumber: `pattern/id-hyphenation-patterns/output/ground_truth.txt` (72.659 kata, format `kata\tpemenggalan`), benchmark via `src/benchmark_engines_suite.js` (harus `minWordLength: 2` agar adil; default Hyphenopoly 6 membuat laporan bias).
- **Set ter-filter (72.259, artefak KBBI dibuang):** Hyphenopoly `id.wasm` = **72.250/72.259 = 99.988%** (9 salah, semua bentuk infiks kosong yang tidak representable: `peng--an`, `per--an`, `ber--an`, dst.). hypher/hyphen + pattern published = 72.252 (7 salah).
- **Set tak-ter-filter (72.659):** 72.252 = **99.440%**; sisa 407 salah = 398 artefak KBBI (awal/akhir hyphen) + 9 bentuk infiks kosong.
- EYD V: 0 pelanggaran genuin; selisih vs hypher hanya 2 kata (`pengan`, `peran`) yang membutuhkan infiks kosong.

## 8. Script npm

| Script | Fungsi |
|--------|--------|
| `npm test` | Jalankan seluruh test suite (tap + c8) |
| `npm run lint` | eslint + remark lint pada md |
| `npm run prepare` | Minify via `tools/minify.mjs` |
| `npm run createWasmForLang` | Build wasm satu bahasa (`sh tools/createWasmForLang.sh en-us`) |
| `npm run createAllWasm` | Build semua wasm |
| `npm run beforeRelease` | Prepare + salin ke `docs/` |
| `npm run doc` | Jekyll docs server |

## 9. Bahasa Didukung

75 bahasa (termasuk `id`), masing-masing punya file di `lang/<kode>/` dan `patterns/<kode>.wasm` serta versi minified di `min/patterns/`.

## 10. Catatan Pengembangan Lanjutan

- Regenerasi pattern: perlu dataset pemenggalan KBBI yang lebih besar → `hyph-id.hyp.txt` → patgen → `hyph-id.pat.txt` → jalankan pipeline 3.4.
- Evaluasi akurasi: `node tools/validatePatterns.js --file wordlist.txt` dengan format `<kata>\t<expected>`.
- Sinkronisasi: upstream `mnater/Hyphenopoly`; diff utama pada `lang/id/`, `test/indonesian.js`, `docs/Indonesian.md`, dan `tools/validatePatterns.js`.
