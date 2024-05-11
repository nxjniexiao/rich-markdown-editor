import { EditorState, Plugin, Transaction } from "prosemirror-state";
import Node from "./Node";
import { HTMLView } from "../node-views/html-view";
import inlineHtmlPairs from "../rules/inlineHtmlPairs";

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
      attrs: {
        content: {
          default: "",
        },
      },
      parseDOM: [
        {
          tag: "span.html_inline",
          getAttrs: (dom: HTMLDivElement) => ({
            content: dom.dataset.content,
          }),
        },
      ],
      toDOM: node => [
        "span",
        { class: "html_inline", "data-content": node.attrs.content },
        0,
      ],
    };
  }

  commands({ type /*, schema*/ }) {
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
              type.create({ content: `<span>${text}</span>` }, null)
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
    return [inlineHtmlPairs];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.text(node.attrs.content, false);
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "html_inline",
      getAttrs: token => {
        const content = token.content;
        return {
          content,
        };
      },
    };
  }
}
