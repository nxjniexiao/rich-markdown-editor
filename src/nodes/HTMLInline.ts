import { EditorState, Plugin, Transaction } from "prosemirror-state";
import Node from "./Node";
import { HTMLView } from "../node-views/html-view";
import html from "../rules/html";

export default class HTMLInline extends Node {
  get name() {
    return "html_inline";
  }

  get schema() {
    return {
      group: "inline",
      content: "text*",
      inline: true,
      atom: true,
      parseDOM: [
        {
          tag: "span.html_inline",
        },
      ],
      toDOM: () => ["span", { class: "html_inline" }, 0],
    };
  }

  commands({ type, schema }) {
    return attrs => (
      state: EditorState,
      dispatch?: (tr: Transaction) => void
    ) => {
      const node = state.doc.cut(state.selection.from, state.selection.to);
      const text = node.textContent;
      if (!text) return false;
      if (dispatch) {
        dispatch(
          state.tr
            .replaceSelectionWith(
              type.create(null, schema.text(`<span>${text}</span>`))
            )
            .scrollIntoView()
        );
      }
      return true;
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          nodeViews: {
            html_inline: (node, view, getPos: () => number) =>
              new HTMLView(node, view, getPos, true),
          },
        },
      }),
    ];
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [html];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.text(node.textContent, false);
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      block: "html_inline",
    };
  }
}
