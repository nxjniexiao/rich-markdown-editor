import MarkdownIt from "markdown-it";

const ATTACHMENT_REGEX = /^\[\[(attach|cmap|word): ([0-9a-f\-]*)\]\]/;

export default function markdownItAttachment(md: MarkdownIt): void {
  function renderAttachment(tokens, idx) {
    const token = tokens[idx];
    const type = token.attrGet("type");
    const id = token.attrGet("id");

    return `[[${type}: ${id}]]`;
  }

  md.renderer.rules.attachment = renderAttachment;

  md.inline.ruler.after("escape", "attachment", (state, silent) => {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);
    const markerAfter = state.src.charCodeAt(start + 1);

    // attachments starts with "[["
    if (marker !== 0x5b /* [ */ || markerAfter !== 0x5b /* [ */) {
      return false;
    }

    const str = state.src.slice(start);
    const match = ATTACHMENT_REGEX.exec(str);
    if (match) {
      if (!silent) {
        const type = match[1];
        const id = match[2];
        const token = state.push("attachment", "attachment", 0);
        token.content = match[0];
        token.attrPush(["type", type]);
        token.attrPush(["id", id]);
      }

      state.pos += match[0].length;
      return true;
    }

    return false;
  });
}
