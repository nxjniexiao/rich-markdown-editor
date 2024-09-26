import MarkdownIt from "markdown-it";

const REF_REGEX = /^<ref name="([^"]+)">/;

export default function markdownItLiteratureReference(md: MarkdownIt): void {
  function renderLiteratureReference(tokens, idx) {
    const token = tokens[idx];
    if (token.nesting === 1) {
      // opening tag
      return `<references>`;
    } else {
      // closing tag
      return `</references>`;
    }
  }

  md.renderer.rules.reference = renderLiteratureReference;

  md.block.ruler.after(
    "blockquote",
    "literatureReference",
    literatureReference,
    {
      alt: ["paragraph", "reference", "blockquote", "list"],
    }
  );
}

// support for literature references:
// <references>
// <ref name="literature name">literature info</ref>
// </references>
function literatureReference(state, start, end, silent) {
  const getLine = (lineNumber: number) => {
    const pos = state.bMarks[lineNumber] + state.tShift[lineNumber];
    const max = state.eMarks[lineNumber];
    const line = state.src.slice(pos, max);
    return line;
  };

  const line = getLine(start).slice();

  // start tag of references
  if (line !== "<references>") {
    return false;
  }

  if (silent) {
    return true;
  }

  let next = start;
  let found = false;
  const refs: { name: string; content: string }[] = [];

  // check line by line
  for (; !found; ) {
    next++;

    if (next >= end) {
      break;
    }

    const line = getLine(next).slice();

    // end tag of references
    if (line === "</references>") {
      found = true;
      break;
    }

    // ref in references
    const endTag = line.slice(-6);
    const match = REF_REGEX.exec(line);
    if (match && endTag === "</ref>") {
      const name = match[1];
      const content = line.slice(match[0].length, line.length - 6);
      refs.push({
        name,
        content,
      });
    }
  }

  if (!found) {
    return false;
  }

  state.line = next + 1;

  let token;
  token = state.push("literature_reference_open", "p", 1);

  refs.forEach(ref => {
    const { name, content } = ref;

    token = state.push("literature_reference_item_open", "div", 1);
    token.attrPush(["name", name]);

    token = state.push("inline", "", 0);
    token.content = content;
    token.children = [];

    token = state.push("literature_reference_item_close", "div", -1);
  });

  token = state.push("literature_reference_close", "p", -1);

  return true;
}
