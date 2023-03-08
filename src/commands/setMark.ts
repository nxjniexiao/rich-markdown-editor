import { MarkType, ResolvedPos } from "prosemirror-model";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { getMarkAttributes, markApplies } from "../helpers";

// setMark from tiptap
export function setMark(markType: MarkType, attrs: { [key: string]: unknown }) {
  return function(
    state: EditorState,
    dispatch: (tr: Transaction) => void
  ): boolean {
    let $cursor: ResolvedPos | null | undefined;
    const { empty, ranges } = state.selection;
    if (state.selection instanceof TextSelection) {
      $cursor = state.selection.$cursor;
    }
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType))
      return false;
    if (dispatch) {
      const tr = state.tr;
      if (empty) {
        const oldAttributes = getMarkAttributes(state, markType);

        tr.addStoredMark(
          markType.create({
            ...oldAttributes,
            ...attrs,
          })
        );
      } else {
        ranges.forEach(range => {
          const from = range.$from.pos;
          const to = range.$to.pos;

          state.doc.nodesBetween(from, to, (node, pos) => {
            const trimmedFrom = Math.max(pos, from);
            const trimmedTo = Math.min(pos + node.nodeSize, to);
            const someHasMark = node.marks.find(mark => mark.type === markType);

            // if there is already a mark of this type
            // we know that we have to merge its attributes
            // otherwise we add a fresh new mark
            if (someHasMark) {
              node.marks.forEach(mark => {
                if (markType === mark.type) {
                  tr.addMark(
                    trimmedFrom,
                    trimmedTo,
                    markType.create({
                      ...mark.attrs,
                      ...attrs,
                    })
                  );
                }
              });
            } else {
              tr.addMark(trimmedFrom, trimmedTo, markType.create(attrs));
            }
          });
        });
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}
