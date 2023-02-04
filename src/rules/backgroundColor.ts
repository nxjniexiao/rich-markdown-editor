import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

export default function markdownItBackgroundColor(md: MarkdownIt): void {
  function renderColor(tokens, idx) {
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

  function renderBackgroundColor(tokens, idx) {
    const token = tokens[idx];
    const backgroundColor = token.attrGet("backgroundColor");

    if (token.nesting === 1) {
      // opening tag
      return `<span style="background-color: ${backgroundColor}">`;
    } else {
      // closing tag
      return "</span>";
    }
  }

  md.renderer.rules.color_open = renderColor;
  md.renderer.rules.color_close = renderColor;
  md.renderer.rules.backgroundColor_open = renderBackgroundColor;
  md.renderer.rules.backgroundColor_close = renderBackgroundColor;

  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "backgroundColor", state => {
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
              const text = current.content;
              colorTokensManager.find(text);
              const newTokens = colorTokensManager.tokens();
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

type Separation = {
  type: "color" | "backgroundColor";
  nesting: 1 | -1;
  index: number;
  fixIndexAfter: number;
  color?: string;
  pair: Separation;
};

class ColorTokensManager {
  static BG_COLOR_REGEX = /<<<(#(?:[0-9a-f]{3}){1,2}|rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d+(?:\.\d+)?))?\))\s(.*?)>>>/i;
  static COLOR_REGEX = /<<(#(?:[0-9a-f]{3}){1,2}|rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d+(?:\.\d+)?))?\))\s(.*?)>>/i;

  separations: Separation[] = [];
  originalText: string;
  text: string;

  insert(separation: Separation, i: number) {
    const index = separation.index;
    let sameIndexSeparation: Separation | undefined;
    for (; i < this.separations.length; i++) {
      const current = this.separations[i];
      if (current?.index > index) break;
      // index 相同时，找到 nesting 相同的分割点
      if (current?.index === index && current.nesting === separation.nesting) {
        sameIndexSeparation = current;
        break;
      }
    }
    if (sameIndexSeparation) {
      let targetPairIndex = sameIndexSeparation.pair.index;
      let separationPairIndex = separation.pair.index;
      if (
        separation.nesting === -1 &&
        targetPairIndex === separationPairIndex
      ) {
        targetPairIndex = this.separations.findIndex(
          item => item === (sameIndexSeparation as Separation).pair
        );
        separationPairIndex = this.separations.findIndex(
          item => item === separation.pair
        );
      }
      i = targetPairIndex < separationPairIndex ? i : i + 1;
    }
    this.separations.splice(i, 0, separation);
    return i;
  }

  add(separations: [Separation, Separation]) {
    let start = 0;
    separations.forEach(separation => {
      start = this.insert(separation, start) + 1;
      // 修正插入位置后面的index
      for (let i = start; i < this.separations.length; i++) {
        this.separations[i].index += separation.fixIndexAfter;
      }
    });
  }

  find(text) {
    this.originalText = this.text = text;
    this.separations = [];
    const arr: [RegExp, Separation["type"]][] = [
      [ColorTokensManager.BG_COLOR_REGEX, "backgroundColor"],
      [ColorTokensManager.COLOR_REGEX, "color"],
    ];
    arr.forEach(([reg, type]) => {
      let match: RegExpExecArray | null;
      while ((match = reg.exec(this.text))) {
        const index = match.index;
        const color = match[1];
        const coloredText = match[6];
        const openSeparation = {
          type,
          nesting: 1,
          index,
          fixIndexAfter: -(color.length + (type === "color" ? 3 : 4)), // color: 2, i.e. "<<" and a space after color
          color,
        } as Separation;
        const closeSeparation = {
          type,
          nesting: -1,
          index: index + coloredText.length,
          fixIndexAfter: -(type === "color" ? 2 : 3), // color: ">>", backgroundColor: ">>>"
        } as Separation;
        openSeparation.pair = closeSeparation;
        closeSeparation.pair = openSeparation;
        this.add([openSeparation, closeSeparation]);
        this.text = this.text.replace(reg, "$6");
      }
    });
  }

  tokens() {
    const tokens: Token[] = [];
    if (this.separations.length > 0) {
      let start = 0;
      this.separations.forEach(({ index, type, color, nesting }, i) => {
        const str = this.text.slice(start, index);
        if (str) {
          const textToken = new Token("text", "", 0);
          textToken.content = str;
          tokens.push(textToken);
        }
        const colorToken = new Token(
          `${type}${nesting === 1 ? "_open" : "_close"}`,
          "",
          nesting
        );
        if (nesting === 1) colorToken.attrs = [[type, color || ""]];
        tokens.push(colorToken);
        // 处理最后一段文字
        const lastIndex = this.separations.length - 1;
        const last = this.separations[lastIndex];
        if (i === lastIndex && last.index < this.text.length) {
          const str = this.text.slice(last.index);
          const textToken = new Token("text", "", 0);
          textToken.content = str;
          tokens.push(textToken);
        }
        start = index;
      });
    }
    return tokens;
  }
}

const colorTokensManager = new ColorTokensManager();
