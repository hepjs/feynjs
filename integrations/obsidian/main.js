// feynjs for Obsidian: a ```feynman (or ```feynjs) code block is drawn as a Feynman diagram in the
// note, in Obsidian's own text colour, so it follows light and dark themes. Bundled by build.mjs
// into the plugin's main.js.
import { Plugin } from "obsidian";
import { render } from "../../src/index.ts";

let drawn = 0;

export default class FeynjsPlugin extends Plugin {
  async onload() {
    this.loadLabelFont();
    const draw = (source, el) => {
      el.addClass("feynjs-obsidian");
      try {
        // (each diagram its own ids, so the patterns of several in one note never clash)
        el.innerHTML = render(source, { idPrefix: `feynjs-obs-${drawn++}` });
      } catch (error) {
        el.createEl("pre", { cls: "feynjs-error", text: String(error?.message ?? error) });
      }
    };
    this.registerMarkdownCodeBlockProcessor("feynman", draw);
    this.registerMarkdownCodeBlockProcessor("feynjs", draw);
  }

  /** The diagrams' label face, New Computer Modern, from the plugin's own folder. */
  loadLabelFont() {
    const dir = this.manifest.dir;
    if (!dir) return;
    const url = (file) => this.app.vault.adapter.getResourcePath(`${dir}/${file}`);
    const style = document.createElement("style");
    style.id = "feynjs-obsidian-font";
    style.textContent = `@font-face { font-family: "NewComputerModern10"; src: url("${url("NewCM10-Book.otf")}") format("opentype"); font-style: normal; }
@font-face { font-family: "NewComputerModern10"; src: url("${url("NewCM10-BookItalic.otf")}") format("opentype"); font-style: italic; }`;
    document.head.appendChild(style);
    this.register(() => style.remove());
  }
}
