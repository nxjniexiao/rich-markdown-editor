import {
  EditorState,
  NodeSelection,
  Plugin,
  Transaction,
} from "prosemirror-state";
import Node from "./Node";
import { HTMLView } from "../node-views/html-view";

export default class HTMLBlock extends Node {
  get name() {
    return "html_block";
  }

  get schema() {
    return {
      group: "block",
      content: "text*",
      inline: false,
      atom: true,
      code: true,
      parseDOM: [
        {
          tag: "div.html_block",
        },
      ],
      toDOM: () => ["div", { class: "html_block" }, 0],
    };
  }

  commands({ type, schema }) {
    return attrs => (
      state: EditorState,
      dispatch?: (tr: Transaction) => void
    ) => {
      if (dispatch) {
        const node = state.doc.cut(state.selection.from, state.selection.to);
        const text = node.textContent;
        let tr = state.tr;
        const newNode = type.create(
          null,
          schema.text(`<div>\n${text || "..."}\n</div>`)
        );
        tr = tr.replaceSelectionWith(newNode);
        tr = tr.setSelection(
          NodeSelection.create(
            tr.doc,
            tr.selection.$from.before() - newNode.nodeSize
          )
        );
        dispatch(tr);
      }
      return true;
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          nodeViews: {
            html_block: (node, view, getPos: () => number) =>
              new HTMLView(node, view, getPos, false),
          },
        },
      }),
    ];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.ensureNewLine();
    state.text(node.textContent, false);
    state.write("\n\n");
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      block: "html_block",
    };
  }
}
