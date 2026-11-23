// Build the Obsidian plugin into integrations/obsidian/dist: main.js (feynjs bundled in, Obsidian's
// own module left to Obsidian), manifest.json, styles.css and the label fonts. Copy that folder
// into a vault as .obsidian/plugins/feynjs.
import { build } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname, out = `${here}dist/feynjs`;
mkdirSync(out, { recursive: true });
await build({ entryPoints: [`${here}main.js`], bundle: true, format: "cjs", target: "es2020", external: ["obsidian"], outfile: `${out}/main.js`, logLevel: "info" });
for (const f of ["manifest.json", "styles.css"]) copyFileSync(`${here}${f}`, `${out}/${f}`);
for (const f of ["NewCM10-Book.otf", "NewCM10-BookItalic.otf"]) copyFileSync(`${here}../../docs/fonts/${f}`, `${out}/${f}`);
