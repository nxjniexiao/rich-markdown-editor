import Node from "../../../nodes/Node";
import markdownItRef from "./ref-rule";

export default class Ref extends Node {
  get name() {
    return "ref";
  }

  get schema() {
    return {
      group: "inline",
      content: "text*",
      inline: true,
      atom: true,
      selectable: false,
      attrs: {
        name: {
          default: "", // name of reference
        },
      },
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
          getAttrs: (dom: HTMLElement) => {
            const name = dom.getAttribute("data-name") || "";
            return { name };
          },
        },
      ],
      toDOM: node => [
        "span",
        { class: this.name, "data-name": node.attrs.name },
        node.attrs.name,
      ],
    };
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write(`<ref name="${node.attrs.name}"/>`);
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItRef];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "ref",
      getAttrs: tok => ({
        name: tok.attrGet("name"),
      }),
    };
  }
}
