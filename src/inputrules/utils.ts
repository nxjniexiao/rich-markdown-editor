import { InputRule } from 'prosemirror-inputrules';
// eslint-disable-next-line prettier/prettier
import type { NodeType, Node } from 'prosemirror-model';
import { NodeSelection  } from 'prosemirror-state';

type GetAttrs =
  | {
      content?: Node;
      [key: string]: any;
    }
  | ((p: string[]) => { content?: Node; [key: string]: any });

export function changeNodeRule(regExp: RegExp, nodeType: NodeType, getAttrs?: GetAttrs) {
  return new InputRule(regExp, (state, match, start, end) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...attrs } = (getAttrs instanceof Function ? getAttrs(match) : getAttrs) ?? {};
    const tr = state.tr
      .delete(start, end)
      .setNodeMarkup(state.selection.$from.before(), nodeType, attrs)
      .scrollIntoView();
    const selected = tr.setSelection(NodeSelection.create(tr.doc, tr.selection.$from.before()));
    return selected;
  });
}
