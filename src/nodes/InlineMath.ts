import { Plugin } from "prosemirror-state";
import { MathView } from "../node-views/math-view";
import inlineMathRule from "../rules/inlineMath";
import Node from "./Node";

export default class InlineMath extends Node {
  get name() {
    return "inline_math";
  }

  get schema() {
    return {
      group: "inline",
      content: "text*",
      inline: true,
      atom: true,
      parseDom: [{ tag: "math[inline]" }],
      toDom: () => ["math", { inline: "" }, 0],
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          nodeViews: {
            inline_math: (node, view, getPos: () => number) =>
              new MathView(node, view, getPos, true),
          },
        },
      }),
    ];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write("$");
    state.renderContent(node);
    state.write("$");
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [inlineMathRule];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      block: "inline_math",
    };
  }
}
