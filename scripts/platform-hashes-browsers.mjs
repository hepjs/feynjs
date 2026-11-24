// The platform check in real browsers: every diagram drawn by the page bundle
// (dist/feynjs.min.js) in Chromium (V8), Firefox (SpiderMonkey) and WebKit (Safari's
// JavaScriptCore), hashed as scripts/platform-hashes.mjs hashes them.
//
//   npm install --no-save playwright && npx playwright install chromium firefox webkit
//   node scripts/platform-hashes-browsers.mjs [--out-dir dir]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, firefox, webkit } from "playwright";
import { diagramSources, hashOfSvg, hashRecord } from "./lib/diagram-sources.mjs";

const outDir = process.argv[2] === "--out-dir" ? process.argv[3] : undefined;
const files = diagramSources();
const sources = files.map((file) => readFileSync(file, "utf8"));

for (const [name, browserType] of Object.entries({ chromium, firefox, webkit })) {
  const record = await hashInBrowser(name, browserType);
  if (outDir) writeFileSync(join(outDir, `hashes-${name}.json`), JSON.stringify(record, null, 1));
  console.log(`${record.engine} on ${record.platform}: ${record.count} diagrams, digest ${record.digest}`);
}

async function hashInBrowser(name, browserType) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage();
    await page.addScriptTag({ path: "dist/feynjs.min.js" });
    const drawings = await page.evaluate((all) => all.map((source) => {
      try { return globalThis.feynjs.render(source); } catch (error) { return `error: ${error.message}`; }
    }), sources);
    const hashes = Object.fromEntries(files.map((file, i) => [file, hashOfSvg(drawings[i])]));
    return hashRecord(`${name} ${browser.version()}`, `${process.platform}-${process.arch}`, hashes);
  } finally {
    await browser.close();
  }
}
