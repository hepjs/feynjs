// The browser file, feynjs.min.js: what a page needs to draw diagrams, and toTikz, which the download
// menu offers; the other tools (check, measure, describe, toSource) are in feynjs-full.min.js.
export * from "./page.ts";
export { toTikz } from "./tools-api.ts";
import { drawPageOnLoad } from "./page.ts";

// (the script tag alone draws the page: see drawPageOnLoad)
drawPageOnLoad();
