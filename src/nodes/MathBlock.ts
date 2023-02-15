import { NodeSelection, Plugin } from "prosemirror-state";
import { setBlockType } from "prosemirror-commands";
import { InputRule } from "prosemirror-inputrules";
import { changeNodeRule } from "../inputrules/utils";
import isNodeActive from "../queries/isNodeActive";
import { MathView } from "../node-views/math-view";
import MathRule from "../rules/katex";
import Node from "./Node";

export default class InlineMath extends Node {
  get name() {
    return "math_block";
  }

  get schema() {
    return {
      group: "block",
      content: "text*",
      inline: false,
      atom: true,
      code: true,
      parseDOM: [{ tag: "math:not([inline])" }],
      toDOM: () => ["math", {}, 0],
    };
  }

  commands({ type /*, schema*/ }) {
    return attrs => setBlockTypeThenFocus(type, attrs);
  }

  inputRules({ type /*, schema*/ }): InputRule[] {
    return [changeNodeRule(/^\$\$$/, type)];
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          nodeViews: {
            math_block: (node, view, getPos: () => number) =>
              new MathView(node, view, getPos, false),
          },
        },
      }),
    ];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write("$$");
    state.ensureNewLine();
    state.renderContent(node);
    state.ensureNewLine();
    state.write("$$\n\n");
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [MathRule];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      block: "math_block",
    };
  }
}

export function setBlockTypeThenFocus(type, attrs = {}) {
  return (state, dispatch, view) => {
    const isActive = isNodeActive(type, attrs)(state);

    if (isActive) return false;

    const ret = setBlockType(type, attrs)(state, dispatch);
    if (ret) {
      // 选中此 block
      const tr = view.state.tr;
      dispatch(
        tr.setSelection(
          NodeSelection.create(tr.doc, tr.selection.$from.before())
        )
      );
    }
    return ret;
  };
}
