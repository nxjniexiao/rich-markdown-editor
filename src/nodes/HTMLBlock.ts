import { Plugin } from "prosemirror-state";
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
      attrs: {
        content: {
          default: "",
        },
      },
      parseDOM: [
        {
          tag: "div.html_block",
          getAttrs: (dom: HTMLDivElement) => ({
            content: dom.dataset.content,
          }),
        },
      ],
      toDOM: node => [
        "div",
        { class: "html_block", "data-content": node.attrs.content },
        0,
      ],
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
    state.text(node.attrs.content, false);
    state.write("\n\n");
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "html_block",
      getAttrs: token => {
        const content = token.content.replace(/\n$/, "");
        return {
          content,
        };
      },
    };
  }
}
