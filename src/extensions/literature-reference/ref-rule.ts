import MarkdownIt from "markdown-it";

const REF_REGEX = /^<ref name="([^"]+)"\s?\/>/;

export default function markdownItRef(md: MarkdownIt): void {
  function renderRef(tokens, idx) {
    const token = tokens[idx];
    const name = token.attrGet("type");

    return `<ref name="${name}"/>`;
  }

  md.renderer.rules.ref = renderRef;

  md.inline.ruler.after("escape", "ref", (state, silent) => {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    // ref starts with "<"
    if (marker !== 0x3c /* < */) {
      return false;
    }

    const str = state.src.slice(start);
    const match = REF_REGEX.exec(str);
    if (match) {
      if (!silent) {
        const name = match[1];
        const token = state.push("ref", "span", 0);
        token.content = match[0];
        token.attrPush(["name", name]);
      }

      state.pos += match[0].length;
      return true;
    }

    return false;
  });
}
