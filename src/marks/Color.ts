import { toggleMark } from "prosemirror-commands";
import Mark from "./Mark";

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
          tag: "span",
          style: "color",
          getAttrs: value => {
            return {
              color: value.color,
            };
          },
        },
      ],
      toDOM: node => ["span", { style: `color: ${node.attrs.color}` }],
    };
  }

  get toMarkdown() {
    return {
      open(_state, _mark) {
        return `<span style="color: ${_mark.attrs.color}">`;
      },
      close: "</span>",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    const newLocal = "color";
    return {
      mark: newLocal,
      getAttrs: tok => ({
        color: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
      }),
    };
  }

  commands({ type }) {
    return ({ color }) => {
      console.log("color: ", color); // TODO: remove
      return toggleMark(type, { color });
    };
  }
}
