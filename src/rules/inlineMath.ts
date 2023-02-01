import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

const INLINE_MATH_REGEX = /\$([^$]*)\$(?!\d)/;

export default function markdownItInlineMath(md: MarkdownIt): void {
  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "inline_math", state => {
    const tokens = state.tokens;
    let i = tokens.length;
    while (i--) {
      const token = tokens[i];
      if (token.type === "inline") {
        const tokenChildren = token.children;
        if (tokenChildren) {
          let j = tokenChildren.length;
          while (j--) {
            const current = tokenChildren[j];
            if (current.type === "text") {
              const newTokens: Token[] = [];
              const reg = new RegExp(INLINE_MATH_REGEX, "g");
              let match: RegExpExecArray | null;
              let start = 0;
              while ((match = reg.exec(current.content))) {
                const index = match.index;
                const mathText = match[1];
                const prevStr = current.content.slice(start, index);
                if (prevStr.length > 0) {
                  const textToken = new Token("text", "", 0);
                  textToken.content = prevStr;
                  newTokens.push(textToken);
                }
                const inlineMathOpenToken = new Token(
                  "inline_math_open",
                  "",
                  1
                );
                const inlineMathTextToken = new Token("text", "", 0);
                const inlineMathCloseToken = new Token(
                  "inline_math_close",
                  "",
                  -1
                );
                inlineMathTextToken.content = mathText;
                newTokens.push(
                  inlineMathOpenToken,
                  inlineMathTextToken,
                  inlineMathCloseToken
                );
                start = reg.lastIndex;
              }
              if (newTokens.length > 0) {
                tokenChildren.splice(j, 1, ...newTokens);
              }
            }
          }
        }
      }
    }
    return false;
  });
}
