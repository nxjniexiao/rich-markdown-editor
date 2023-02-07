import katex from "katex";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

const MATH_REGEX = /\$\$([^$]*)\$\$/;

export default function markdownItMath(md: MarkdownIt): void {
  function render(tokens, idx) {
    const token = tokens[idx];

    if (token.nesting === 1) {
      // opening tag
      return `<p>`;
    } else {
      // closing tag
      return "</p>";
    }
  }

  md.renderer.rules.math_open = render;
  md.renderer.rules.math_close = render;

  // 修改公式文字的渲染方法
  const renderText = md.renderer.rules.text;
  md.renderer.rules.text = function(tokens, idx, ...rest) {
    const prevTokenType = tokens[idx - 1]?.type;
    if (prevTokenType === "math_open" || prevTokenType === "inline_math_open") {
      return katex.renderToString(tokens[idx].content, {
        displayMode: prevTokenType === "math_open",
      });
    } else {
      return renderText?.(tokens, idx, ...rest);
    }
  };

  // insert a new rule after the "block" rules are parsed
  md.core.ruler.after("block", "math", state => {
    const tokens = state.tokens;
    let i = tokens.length;
    while (i--) {
      const token = tokens[i];
      if (token.type === "inline") {
        const content = token.content;
        if (content.length > 0) {
          const strArr: { type: "math" | "text"; value: string }[] = [];
          const reg = new RegExp(MATH_REGEX, "g");
          let match: RegExpExecArray | null;
          let start = 0;
          while ((match = reg.exec(content))) {
            const index = match.index;
            const mathText = match[1];
            const prevStr = content.slice(start, index);
            if (prevStr.length > 0) {
              strArr.push({ type: "text", value: prevStr });
            }
            strArr.push({ type: "math", value: mathText });
            start = reg.lastIndex;
          }
          if (start > 0 && start < content.length) {
            const str = content.slice(start);
            strArr.push({ type: "text", value: str });
          }
          if (strArr.length > 0) {
            const newTokens: Token[] = [];
            strArr.forEach(str => {
              if (str.type === "text") {
                const inlineToken = new Token("inline", "", 0);
                inlineToken.content = str.value;
                inlineToken.children = [];
                newTokens.push(
                  new Token("paragraph_open", "p", 1),
                  inlineToken,
                  new Token("paragraph_close", "p", -1)
                );
              } else if (str.type === "math") {
                const mathOpenToken = new Token("math_open", "", 1);
                const textToken = new Token("text", "", 0);
                textToken.content = str.value;
                const mathCloseToken = new Token("math_close", "", -1);
                newTokens.push(mathOpenToken, textToken, mathCloseToken);
              }
            });
            tokens.splice(i - 1, 3, ...newTokens);
          }
        }
      }
    }
    return false;
  });
}
