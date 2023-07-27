import MarkdownIt from "markdown-it";

const BLOCK_ATTACHMENT_REGEX = /^\{\{(cmap): ([0-9a-f\-]*)\}\}/;

export default function markdownItBlockAttachment(md: MarkdownIt): void {
  function renderAttachment(tokens, idx) {
    const token = tokens[idx];
    const type = token.attrGet("type");
    const id = token.attrGet("id");

    return `{{${type}: ${id}}}`;
  }

  md.renderer.rules.block_attachment = renderAttachment;

  md.block.ruler.after("blockquote", "block_attachment", block_attachment, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
}

function block_attachment(state, start, end, silent) {
  const pos = state.bMarks[start] + state.tShift[start];
  const max = state.eMarks[start];

  if (pos + 2 > max) {
    return false;
  }

  if (state.src.slice(pos, pos + 2) !== "{{") {
    return false;
  }

  const line = state.src.slice(pos, max);
  const match = BLOCK_ATTACHMENT_REGEX.exec(line);

  if (match) {
    if (silent) return true;

    const type = match[1];
    const id = match[2];
    const token = state.push("block_attachment", "div", 0);
    token.content = match[0];
    token.attrPush(["type", type]);
    token.attrPush(["id", id]);

    state.line = state.line + 1;

    return true;
  }

  return false;
}
