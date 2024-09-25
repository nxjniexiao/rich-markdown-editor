import Node from "../../../nodes/Node";

export default class literatureReference extends Node {
  get name() {
    return "literature_reference";
  }

  get schema() {
    return {
      group: "block",
      content: "literature_reference_item+",
      toDOM: () => ["p", { class: this.name }, 0],
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
        },
      ],
    };
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write(`<references>\n`);
    node.content.forEach(child => {
      state.write(`<ref name="${child.attrs.name}">`);
      state.renderInline(child);
      state.write(`</ref>\n`);
    });
    state.write(`</references>\n`);
    state.closeBlock(node);
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return { block: "literature_reference" };
  }
}
