import {
  BlockQuoteIcon,
  BulletedListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HorizontalRuleIcon,
  OrderedListIcon,
  PageBreakIcon,
  TableIcon,
  TodoListIcon,
  ImageIcon,
  StarredIcon,
  WarningIcon,
  InfoIcon,
  LinkIcon,
  MathIcon,
  MenuIcon,
  TrashIcon,
  DuplicateIcon,
  InsertAboveIcon,
  InsertBelowIcon,
} from "outline-icons";
import { EditorView } from "prosemirror-view";
import { Slice } from "prosemirror-model";
import { TextSelection } from "prosemirror-state";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";

const SSR = typeof window === "undefined";
const isMac = !SSR && window.navigator.platform === "MacIntel";
const mod = isMac ? "⌘" : "ctrl";

export default function sideMenuItems(
  dictionary: typeof baseDictionary
): MenuItem[] {
  return [
    {
      name: "delete",
      title: dictionary.delete,
      keywords: "delete",
      icon: TrashIcon,
      onClick: handleDeleteBlock,
    },
    {
      name: "duplicate",
      title: dictionary.duplicate,
      keywords: "duplicate",
      icon: DuplicateIcon,
      onClick: handleDuplicateBlock,
    },
    {
      name: "add_block_above",
      title: dictionary.addBlockAbove,
      keywords: "add block above",
      icon: InsertAboveIcon,
      onClick: handleAddBlock(true),
    },
    {
      name: "add_block_below",
      title: dictionary.addBlockBelow,
      keywords: "add block below",
      icon: InsertBelowIcon,
      onClick: handleAddBlock(false),
    },
    {
      name: "separator",
    },
    {
      name: "paragraph",
      title: dictionary.text,
      keywords: "text",
      icon: MenuIcon,
      shortcut: "^ ⇧ 0",
    },
  ];
}

function handleDeleteBlock(view: EditorView, onClose: () => void) {
  let tr = view.state.tr;
  tr = tr.replaceSelection(Slice.empty);
  view.dispatch(tr);
  onClose();
}

function handleDuplicateBlock(view: EditorView, onClose: () => void) {
  let tr = view.state.tr;
  const selection = view.state.selection;
  tr = tr.replace(selection.from, selection.from, selection.content());
  view.dispatch(tr);
  onClose();
}

function handleAddBlock(above: boolean) {
  return function(view: EditorView, onClose: () => void) {
    const paragraph = view.state.schema.node("paragraph");
    const selection = view.state.selection;
    const idx = above ? selection.from : selection.to;
    let tr = view.state.tr;
    tr = tr.replaceWith(idx, idx, paragraph);
    tr = tr.setSelection(TextSelection.create(tr.doc, idx));
    view.dispatch(tr);
    view.focus();
    onClose();
  };
}
