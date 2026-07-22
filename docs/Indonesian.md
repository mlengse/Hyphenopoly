# Indonesian Hyphenation

Hyphenopoly supports Indonesian (Bahasa Indonesia) with patterns based on KBBI 2025 data.

## Setup

### Browser

```html
<script src="./Hyphenopoly_Loader.js"></script>
<script>
Hyphenopoly.config({
    require: {
        "id": "keterampilan"
    },
    setup: {
        selectors: {
            ".container": {}
        }
    }
});
</script>
<style>
.container {
    display: flex;
    hyphens: auto;
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
}
</style>
```

### Node.js

```javascript
import hyphenopoly from "hyphenopoly";

const hyphenator = hyphenopoly.config({
    "loader": async (file, patDir) => {
        const {readFile} = await import("node:fs/promises");
        return readFile(new URL(file, patDir));
    },
    "require": ["id"]
});

const hyphenateId = await hyphenator.get("id");
console.log(hyphenateId("Tipografi adalah seni dan teknik memilih dan menata huruf."));
// Output: Ti·po·gra·fi ada·lah seni dan tek·nik me·mi·lih dan me·na·ta hu·ruf.
```

## Examples

| Kata | Hasil |
|------|-------|
| Indonesia | In·do·ne·sia |
| pendidikan | pen·di·di·kan |
| teknologi | tek·no·lo·gi |
| pemerintahan | pe·me·rin·ta·han |
| kemerdekaan | ke·mer·de·ka·an |
| pembelajaran | pem·be·la·ja·ran |
| perkembangan | per·kem·ban·gan |
| pengembangan | pen·gem·ban·gan |
| menciptakan | men·cip·ta·kan |
| kesenian | ke·se·ni·an |

## Kata Majemuk (Compound Words)

Indonesian compound words with hyphens are preserved:

| Kata | Hasil |
|------|-------|
| kereta-api | kereta-api |
| rumah-sakit | rumah-sakit |

## Configuration Options

### minWordLength

Default: 6. Words shorter than this are not hyphenated.

```javascript
Hyphenopoly.config({
    require: {"id": "keterampilan"},
    setup: {
        selectors: {
            ".container": {
                "minWordLength": 4
            }
        }
    }
});
```

### leftmin / rightmin

Controls minimum characters before/after the first/last hyphenation point.

```javascript
Hyphenopoly.config({
    require: {"id": "keterampilan"},
    setup: {
        selectors: {
            ".container": {
                "leftmin": 4,
                "rightmin": 4
            }
        }
    }
});
```

### Custom Hyphen Character

```javascript
Hyphenopoly.config({
    require: {"id": "keterampilan"},
    hyphen: "\u00B7"  // middle dot
});
```

## Tested Words

The following 52 words have been validated against the patterns:

**Kata Dasar:** Indonesia, pendidikan, teknologi, Negara, terbesar, Tipografi, adalah, kesenian, teknik, memilih, dengan, pengaturan, tersedia, menciptakan, membaca, semaksimal, mungkin

**Kata Berimbuhan:** mempelajari, kependidikan, pemerintahan, belajar, terjadi, pemerintah, pembelajaran, kemerdekaan, keindahan, pengembangan, perkembangan, pertumbuhan, kesehatan

**Kata Majemuk:** kereta-api, rumah-sakit

## Known Limitations

1. **Short words**: Words with fewer than 6 characters are not hyphenated by default. Adjust `minWordLength` if needed.
2. **Compound words**: Hyphenated compound words (e.g., kereta-api) preserve the existing hyphen but do not add additional hyphenation points within each component.
3. **Alphabet**: Only Latin characters (a-z, A-Z) are supported. No special Indonesian characters are needed as Indonesian uses standard Latin alphabet.
4. **Pattern source**: Based on KBBI 2025 data. Some very new or informal words may not hyphenate optimally.
