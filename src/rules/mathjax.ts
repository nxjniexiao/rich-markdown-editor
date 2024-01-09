// copy from https://github.com/waylonflinn/markdown-it-katex
import { renderMath2SVG } from "../node-views/mathjax-view/render-math-2-svg";

// Test if potential opening or closing delimieter
// Assumes that there is a "$" at state.src[pos]
function isValidDelim(state, pos) {
  const max = state.posMax;
  let can_open = true;
  let can_close = true;

  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  const nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

  // Check non-whitespace conditions for opening and closing, and
  // check that closing delimeter isn't followed by a number
  if (
    prevChar === 0x20 /* " " */ ||
    prevChar === 0x09 /* \t */ ||
    (nextChar >= 0x30 /* "0" */ && nextChar <= 0x39) /* "9" */
  ) {
    can_close = false;
  }
  if (nextChar === 0x20 /* " " */ || nextChar === 0x09 /* \t */) {
    can_open = false;
  }

  return {
    can_open: can_open,
    can_close: can_close,
  };
}

function math_inline(state, silent) {
  let match, token, res, pos;

  if (state.src[state.pos] !== "$") {
    return false;
  }

  res = isValidDelim(state, state.pos);
  if (!res.can_open) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos += 1;
    return true;
  }

  // First check for and bypass all properly escaped delimieters
  // This loop will assume that the first leading backtick can not
  // be the first character in state.src, which is known since
  // we have found an opening delimieter already.
  const start = state.pos + 1;
  match = start;
  while ((match = state.src.indexOf("$", match)) !== -1) {
    // Found potential $, look for escapes, pos will point to
    // first non escape when complete
    pos = match - 1;
    while (state.src[pos] === "\\") {
      pos -= 1;
    }

    // Even number of escapes, potential closing delimiter found
    if ((match - pos) % 2 === 1) {
      break;
    }
    match += 1;
  }

  // No closing delimter found.  Consume $ and continue.
  if (match === -1) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos = start;
    return true;
  }

  // Check if we have empty content, ie: $$.  Do not parse.
  if (match - start === 0) {
    if (!silent) {
      state.pending += "$$";
    }
    state.pos = start + 1;
    return true;
  }

  // Check for valid closing delimiter
  res = isValidDelim(state, match);
  if (!res.can_close) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos = start;
    return true;
  }

  if (!silent) {
    token = state.push("math_inline_open", "", 1);
    token.markup = "$";

    token = state.push("text", "", 0);
    token.content = state.src.slice(start, match);

    token = state.push("math_inline_close", "", -1);
  }

  state.pos = match + 1;
  return true;
}

function math_block(state, start, end, silent) {
  let firstLine,
    lastLine,
    next,
    lastPos,
    found = false,
    token,
    pos = state.bMarks[start] + state.tShift[start],
    max = state.eMarks[start];

  if (pos + 2 > max) {
    return false;
  }
  if (state.src.slice(pos, pos + 2) !== "$$") {
    return false;
  }

  pos += 2;
  firstLine = state.src.slice(pos, max);

  if (silent) {
    return true;
  }
  if (firstLine.trim().slice(-2) === "$$") {
    // Single line expression
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }

  for (next = start; !found; ) {
    next++;

    if (next >= end) {
      break;
    }

    pos = state.bMarks[next] + state.tShift[next];
    max = state.eMarks[next];

    if (pos < max && state.tShift[next] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      break;
    }

    if (
      state.src
        .slice(pos, max)
        .trim()
        .slice(-2) === "$$"
    ) {
      lastPos = state.src.slice(0, max).lastIndexOf("$$");
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  token = state.push("math_block_open", "p", 1);
  token.map = [start, state.line];
  token.markup = "$$";

  token = state.push("text", "", 0);
  token.content =
    (firstLine && firstLine.trim() ? firstLine + "\n" : "") +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine && lastLine.trim() ? lastLine : "");

  token = state.push("math_block_close", "p", -1);

  return true;
}

function math_plugin(md) {
  md.inline.ruler.after("escape", "math_inline", math_inline);
  md.block.ruler.after("blockquote", "math_block", math_block, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  function renderMathInline(tokens, idx) {
    const token = tokens[idx];

    if (token.nesting === 1) {
      // opening tag
      return ``;
    } else {
      // closing tag
      return "";
    }
  }

  md.renderer.rules.math_inline_open = renderMathInline;
  md.renderer.rules.math_inline_close = renderMathInline;

  // 修改公式文字的渲染方法
  const renderText = md.renderer.rules.text;
  md.renderer.rules.text = function(tokens, idx, ...rest) {
    const prevTokenType = tokens[idx - 1]?.type;
    if (
      prevTokenType === "math_block_open" ||
      prevTokenType === "math_inline_open"
    ) {
      try {
        return renderMath2SVG(
          tokens[idx].content,
          prevTokenType === "math_inline_open"
        );
      } catch (_) {
        return tokens[idx].content;
      }
    } else {
      return renderText?.(tokens, idx, ...rest);
    }
  };
}

export default math_plugin;
