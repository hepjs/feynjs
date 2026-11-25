// The Python package (python/): copies the built script into it and gives it the npm package's
// version. Run after `npm run build`, before building the package: node scripts/python-package.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const here = (path) => new URL(`../${path}`, import.meta.url).pathname;
const { version } = JSON.parse(readFileSync(here("package.json"), "utf8"));
copyFileSync(here("dist/feynjs.min.js"), here("python/src/feynjs/static/feynjs.min.js"));
const init = here("python/src/feynjs/__init__.py");
writeFileSync(init, readFileSync(init, "utf8").replace(/^__version__ = ".*"$/m, `__version__ = "${version}"`));
console.log(`python/: feynjs.min.js copied, version ${version}`);
