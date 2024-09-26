import Node from "../../nodes/Node";
import markdownItBlockLiteratureReference from "./reference-rule";

export default class literatureReferenceItem extends Node {
  get name() {
    return "literature_reference_item";
  }

  get schema() {
    return {
      group: "block",
      content: "inline*",
      attrs: {
        name: {
          default: "",
        },
      },
      toDOM: () => ["div", { class: this.name }, 0],
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
        },
      ],
    };
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItBlockLiteratureReference];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      block: "literature_reference_item",
      getAttrs: tok => ({
        name: tok.attrGet("name") || "",
      }),
    };
  }
}
