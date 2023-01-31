import { setMark } from "../commands/setMark";
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

  get toMarkdown() {
    return {
      open(_state, _mark) {
        return `<span style="background-color: ${_mark.attrs.backgroundColor}">`;
      },
      close: "</span>",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  // TODO:
  parseMarkdown() {
    const newLocal = "backgroundColor";
    return {
      mark: newLocal,
      getAttrs: tok => ({
        color: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
      }),
    };
  }

  commands({ type }) {
    return ({ backgroundColor } = { backgroundColor: "" }) => {
      return setMark(type, { backgroundColor });
    };
  }
}
