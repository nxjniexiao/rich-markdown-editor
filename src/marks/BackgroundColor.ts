import { setMark } from "../commands/setMark";
import { unsetMark } from "../commands/unsetMark";
import markdownItBackgroundColor from "../rules/backgroundColor";
import Mark from "./Mark";

export default class BackgroundColor extends Mark {
  get name() {
    return "backgroundColor";
  }

  get schema() {
    return {
      attrs: {
        backgroundColor: {
          default: "",
        },
      },
      parseDOM: [
        {
          style: "background-color",
          getAttrs: value => {
            return {
              backgroundColor: value, // fix: 粘贴时背景颜色会丢失
            };
          },
        },
      ],
      toDOM: node => [
        "span",
        { style: `background-color: ${node.attrs.backgroundColor}` },
      ],
    };
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItBackgroundColor];
  }

  get toMarkdown() {
    return {
      open(_state, _mark) {
        return `<<<${_mark.attrs.backgroundColor} `;
      },
      close: ">>>",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  // 把 markdown-it 的解析结果转换成 mark
  parseMarkdown() {
    return {
      mark: "backgroundColor",
      getAttrs: tok => ({
        backgroundColor: tok.attrGet("backgroundColor"),
      }),
    };
  }

  commands({ type }) {
    return ({ backgroundColor }: { backgroundColor: string }) => {
      return backgroundColor
        ? setMark(type, { backgroundColor })
        : unsetMark(type);
    };
  }
}
