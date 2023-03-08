import { MarkType } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { getMarkRange, getMarkType } from "../helpers";

// unsetMark from tiptap
export function unsetMark(markType: MarkType) {
  return function(
    state: EditorState,
    dispatch: (tr: Transaction) => void
  ): boolean {
    const selection = state.selection;
    const { $from, empty, ranges } = selection;
    const type = getMarkType(markType, state.schema);

    if (!dispatch) {
      return true;
    }

    const tr = state.tr;
    if (empty) {
      let { from, to } = selection;
      const attrs = $from.marks().find(mark => mark.type === type)?.attrs;
      const range = getMarkRange($from, type, attrs);

      if (range) {
        from = range.from;
        to = range.to;
      }

      tr.removeMark(from, to, type);
    } else {
      ranges.forEach(range => {
        tr.removeMark(range.$from.pos, range.$to.pos, type);
      });
    }

    tr.removeStoredMark(type);
    dispatch(tr.scrollIntoView());

    return true;
  };
}
