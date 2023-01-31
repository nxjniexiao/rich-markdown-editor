import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

const COLOR_REGEX = /<<(#(?:[0-9a-f]{3}){1,2}|rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d+(?:\.\d+)?))?\))\s(.*?)>>/i;

export default function markdownItColor(md: MarkdownIt): void {
  function render(tokens, idx) {
    const token = tokens[idx];
    const color = token.attrGet("color");

    if (token.nesting === 1) {
      // opening tag
      return `<span style="color: ${color}">`;
    } else {
      // closing tag
      return "</span>";
    }
  }

  md.renderer.rules.color_open = render;
  md.renderer.rules.color_close = render;

  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "color", state => {
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
              const reg = new RegExp(COLOR_REGEX, "g");
              let match: RegExpExecArray | null;
              let start = 0;
              while ((match = reg.exec(current.content))) {
                const index = match.index;
                const color = match[1];
                const coloredText = match[6];
                const prevStr = current.content.slice(start, index);
                if (prevStr.length > 0) {
                  const textToken = new Token("text", "", 0);
                  textToken.content = prevStr;
                  newTokens.push(textToken);
                }
                const colorOpenToken = new Token("color_open", "", 1);
                const colorTextToken = new Token("text", "", 0);
                const colorCloseToken = new Token("color_close", "", -1);
                colorOpenToken.attrs = [["color", color]];
                colorTextToken.content = coloredText;
                newTokens.push(colorOpenToken, colorTextToken, colorCloseToken);
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
