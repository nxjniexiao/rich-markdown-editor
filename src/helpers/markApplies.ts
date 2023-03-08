import { MarkType, Node } from "prosemirror-model";
import { SelectionRange } from "prosemirror-state";

export function markApplies(
  doc: Node,
  ranges: readonly SelectionRange[],
  type: MarkType
): boolean {
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
