import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
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

  commands({ type, schema }) {
    return attrs => (
      state: EditorState,
      dispatch: (tr: Transaction) => void
    ) => {
      const selectionContent = state.selection.content().content;
      let text = "";
      // 拼接 paragraph 的 text content
      selectionContent.forEach(node => {
        node.content.forEach(_node => {
          if (_node.type === schema.nodes.text) {
            text += _node.text;
          }
        });
      });
      dispatch(
        state.tr
          .replaceSelectionWith(type.create(attrs, schema.text(text)))
          .scrollIntoView()
      );
      return true;
    };
  }

  inputRules({ type /*, schema*/ }): InputRule[] {
    return [
      new InputRule(/\$([^$]*)\$$/, (state, match, start, end) => {
        const { tr, schema } = state;
        // const start = range.from;
        // let end = range.to;
        let content;
        if (match[1]) {
          // "$1.00 and $"
          // "$1.00 and ($"
          if (/^\d/.test(match[1]) || /(\s|\()$/.test(match[1])) {
            return null;
          }
          content = schema.text(match[1]);
        }
        tr.replaceWith(start, end, type.create({}, content));
        return tr;
      }),
    ];
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
