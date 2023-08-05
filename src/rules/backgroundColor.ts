import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

const COLOR_REGEX_START = /^(<<<?)(#(?:[0-9a-f]{3}){1,2}|rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d+(?:\.\d+)?))?\))\s/i;
const COLOR_REGEX_END = /^>{2,5}/;

export default function markdownItBackgroundColor(md: MarkdownIt): void {
  function renderColor(tokens, idx) {
    const token = tokens[idx];
    const type = token.meta?.type;
    const styleName = type === "color" ? "color" : "background-color";
    const color = token.attrGet(type);

    if (token.nesting === 1) {
      // opening tag
      return `<span style="${styleName}: ${color}">`;
    } else {
      // closing tag
      return "</span>";
    }
  }

  md.renderer.rules.color_open = renderColor;
  md.renderer.rules.color_close = renderColor;
  md.renderer.rules.backgroundColor_open = renderColor;
  md.renderer.rules.backgroundColor_close = renderColor;

  // insert a new rule after the "escape" rules are parsed
  md.inline.ruler.after("escape", "backgroundColor", (state, silent) => {
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (marker !== 0x3c /* < */ && marker !== 0x3e /* > */) {
      return false;
    }

    const str = state.src.slice(start);

    if (marker === 0x3c /* < */) {
      const startMatch = COLOR_REGEX_START.exec(str);
      if (startMatch) {
        if (!silent) {
          const type = startMatch[1].length === 3 ? "backgroundColor" : "color";
          const token = state.push("text", "", 0);
          token.content = startMatch[0];
          token.meta = { type };
          token.attrPush([type, startMatch[2]]);

          // @ts-ignore
          state.delimiters.push({
            marker: -1,
            length: 0,
            token: state.tokens.length - 1,
            end: -1,
            open: true,
            close: false,
          });
        }

        state.pos += startMatch[0].length;
        return true;
      }
      return false;
    }

    if (marker === 0x3e /* > */) {
      const endMatch = COLOR_REGEX_END.exec(str);
      if (endMatch) {
        if (!silent) {
          const contentArr: string[] = [];
          if (endMatch[0].length === 5) {
            // 颜色和背景色两个结束标签相邻（需要根据前一个开始标签判断前后关系）
            let lastOpenToken: Token | undefined;
            let i = state.delimiters.length;
            while (i--) {
              const delimiter = state.delimiters[i];
              if (delimiter.marker === -1 && delimiter.open) {
                lastOpenToken = state.tokens[delimiter.token];
                break;
              }
            }
            const lastOpenType = lastOpenToken?.meta?.type;
            if (lastOpenType === "color") {
              contentArr.push(">>", ">>>");
            } else {
              contentArr.push(">>>", ">>");
            }
          } else if (endMatch[0].length === 2) {
            // 颜色结束标签
            contentArr.push(">>");
          } else {
            // 背景色结束标签
            contentArr.push(">>>");
          }

          contentArr.forEach(text => {
            const type = text.length === 3 ? "backgroundColor" : "color";
            const token = state.push("text", "", 0);
            token.content = text;
            token.meta = { type };

            // @ts-ignore
            state.delimiters.push({
              marker: -1,
              length: 0,
              token: state.tokens.length - 1,
              end: -1,
              open: false,
              close: true,
            });
          });
        }

        state.pos += endMatch[0].length;
        return true;
      }

      return false;
    }

    return false;
  });

  // 后处理：根据 delimiters 把对应的文字 token 改为颜色 token
  md.inline.ruler2.after("emphasis", "backgroundColor", state => {
    const delimiters = state.delimiters;
    const max = delimiters.length;
    let i = 0;
    for (; i < max; i++) {
      const startDelim = delimiters[i];

      // 只处理颜色标记
      if (startDelim.marker !== -1) {
        continue;
      }

      // 只处理开始标记
      if (startDelim.end === -1) {
        continue;
      }

      const endDelim = delimiters[startDelim.end];

      let token = state.tokens[startDelim.token];
      token.type = `${token.meta.type}_open`;
      token.nesting = 1;
      token.content = "";

      token = state.tokens[endDelim.token];
      token.type = `${token.meta.type}_close`;
      token.nesting = -1;
      token.content = "";
    }
  });
}
