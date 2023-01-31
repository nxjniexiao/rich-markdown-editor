import { setMark } from "../commands/setMark";
import Mark from "./Mark";
import colorRule from "../rules/color";

export default class Color extends Mark {
  get name() {
    return "color";
  }

  get schema() {
    return {
      attrs: {
        color: {
          default: "currentColor",
        },
      },
      parseDOM: [
        {
          style: "color",
          getAttrs: value => {
            return {
              color: value, // fix: 粘贴时文字颜色会丢失
            };
          },
        },
      ],
      toDOM: node => ["span", { style: `color: ${node.attrs.color}` }],
    };
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [colorRule];
  }

  get toMarkdown() {
    return {
      open(_state, _mark) {
        return `<<${_mark.attrs.color} `;
      },
      close: ">>",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  // 把 markdown-it 的解析结果转换成 mark
  parseMarkdown() {
    return {
      mark: "color",
      getAttrs: tok => {
        return { color: tok.attrGet("color") };
      },
    };
  }

  commands({ type }) {
    return ({ color } = { color: "currentColor" }) => {
      return setMark(type, { color });
    };
  }
}
