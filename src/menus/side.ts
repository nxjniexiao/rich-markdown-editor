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
  ReplaceIcon,
} from "outline-icons";
import { EditorView } from "prosemirror-view";
import { Slice } from "prosemirror-model";
import { NodeSelection, TextSelection } from "prosemirror-state";
import { setBlockType } from "prosemirror-commands";
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
      name: "turn_into",
      title: dictionary.turnInto,
      keywords: "turn into",
      icon: ReplaceIcon,
      subMenus: [
        {
          name: "paragraph",
          title: dictionary.text,
          keywords: "text",
          icon: MenuIcon,
          onClick: handleSetBlockType,
        },
        {
          name: "heading",
          title: dictionary.h1,
          keywords: "h1 heading1 title",
          icon: Heading1Icon,
          attrs: { level: 1 },
          onClick: handleSetBlockType,
        },
        {
          name: "heading",
          title: dictionary.h2,
          keywords: "h2 heading2",
          icon: Heading2Icon,
          attrs: { level: 2 },
          onClick: handleSetBlockType,
        },
        {
          name: "heading",
          title: dictionary.h3,
          keywords: "h3 heading3",
          icon: Heading3Icon,
          attrs: { level: 3 },
          onClick: handleSetBlockType,
        },
      ],
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

function handleSetBlockType(view: EditorView, onClose: () => void) {
  const { selection, schema } = view.state;
  const type = schema.nodes[this.name];
  if (!type) return;
  if (selection instanceof NodeSelection) {
    setBlockType(type, this.attrs)(view.state, view.dispatch);
  }
  onClose();
}
