import { Mark, MarkType, ResolvedPos, Schema } from "prosemirror-model";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";

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

export function getMarkAttributes(
  state: EditorState,
  typeOrName: string | MarkType
): Record<string, any> {
  const type = getMarkType(typeOrName, state.schema);
  const { from, to, empty } = state.selection;
  const marks: Mark[] = [];

  if (empty) {
    if (state.storedMarks) {
      marks.push(...state.storedMarks);
    }

    marks.push(...state.selection.$head.marks());
  } else {
    state.doc.nodesBetween(from, to, node => {
      marks.push(...node.marks);
    });
  }

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (!mark) {
    return {};
  }

  return { ...mark.attrs };
}

export function getMarkType(
  nameOrType: string | MarkType,
  schema: Schema
): MarkType {
  if (typeof nameOrType === "string") {
    if (!schema.marks[nameOrType]) {
      throw Error(
        `There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`
      );
    }

    return schema.marks[nameOrType];
  }

  return nameOrType;
}

function markApplies(doc, ranges, type) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false;
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) return true;
  }
  return false;
}
