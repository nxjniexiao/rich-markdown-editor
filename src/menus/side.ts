import {
  BlockQuoteIcon,
  BulletedListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  OrderedListIcon,
  TodoListIcon,
  MathIcon,
  MenuIcon,
  TrashIcon,
  DuplicateIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  ReplaceIcon,
} from "outline-icons";
import { EditorView } from "prosemirror-view";
import { NodeType, Slice } from "prosemirror-model";
import { EditorState, NodeSelection, TextSelection } from "prosemirror-state";
import { setBlockType } from "prosemirror-commands";
import { isInTable } from "prosemirror-tables";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import isNodeActive from "../queries/isNodeActive";
import isInList from "../queries/isInList";
import toggleList from "../commands/toggleList";
import clearNodes from "../commands/clearNodes";

export default function sideMenuItems(arg: {
  dictionary: typeof baseDictionary;
  state: EditorState;
}): MenuItem[] {
  const { dictionary, state } = arg;
  const { schema } = state;
  const isTable = isInTable(state);
  const isList = isInList(state);
  const allowBlocks = !isTable && !isList;

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
      name: "turn_into",
      title: dictionary.turnInto,
      keywords: "turn into",
      icon: ReplaceIcon,
      subMenus: [
        // PARAGRAPH
        {
          name: "paragraph",
          title: dictionary.text,
          keywords: "text",
          icon: MenuIcon,
          active: isNodeActive(schema.nodes.paragraph),
          visible: true,
          onClick: handleSetBlockType,
        },
        // HEADING
        {
          name: "heading",
          title: dictionary.h1,
          keywords: "h1 heading1 title",
          icon: Heading1Icon,
          active: isNodeActive(schema.nodes.heading, { level: 1 }),
          visible: setBlockType(schema.nodes.heading, { level: 1 })(state),
          attrs: { level: 1 },
          onClick: handleSetBlockType,
        },
        {
          name: "heading",
          title: dictionary.h2,
          keywords: "h2 heading2",
          icon: Heading2Icon,
          active: isNodeActive(schema.nodes.heading, { level: 2 }),
          visible: setBlockType(schema.nodes.heading, { level: 2 })(state),
          attrs: { level: 2 },
          onClick: handleSetBlockType,
        },
        {
          name: "heading",
          title: dictionary.h3,
          keywords: "h3 heading3",
          icon: Heading3Icon,
          active: isNodeActive(schema.nodes.heading, { level: 3 }),
          visible: setBlockType(schema.nodes.heading, { level: 3 })(state),
          attrs: { level: 3 },
          onClick: handleSetBlockType,
        },
        // LIST
        {
          name: "checkbox_list",
          title: dictionary.checkboxList,
          keywords: "checklist checkbox task",
          icon: TodoListIcon,
          active: isNodeActive(schema.nodes.checkbox_list),
          visible: allowBlocks || isList,
          onClick: handleSetBlockListType,
        },
        {
          name: "bullet_list",
          title: dictionary.bulletList,
          keywords: "bullet list",
          icon: BulletedListIcon,
          active: isNodeActive(schema.nodes.bullet_list),
          visible: allowBlocks || isList,
          onClick: handleSetBlockListType,
        },
        {
          name: "ordered_list",
          title: dictionary.orderedList,
          keywords: "ordered list",
          icon: OrderedListIcon,
          active: isNodeActive(schema.nodes.ordered_list),
          visible: allowBlocks || isList,
          onClick: handleSetBlockListType,
        },
        // CODE BLOCK
        {
          name: "code_block",
          title: dictionary.codeBlock,
          keywords: "code block",
          icon: CodeIcon,
          active: isNodeActive(schema.nodes.code_block),
          visible: setBlockType(schema.nodes.code_block)(state),
          onClick: handleSetBlockType,
        },
        // QUOTE
        {
          name: "blockquote",
          title: dictionary.quote,
          keywords: "block quote",
          icon: BlockQuoteIcon,
          active: isNodeActive(schema.nodes.blockquote),
          visible: setBlockType(schema.nodes.blockquote)(state),
          onClick: handleSetBlockType,
        },
        // BLOCK EQUATION
        {
          name: "math_block",
          title: dictionary.blockEquation,
          keywords: "Block equation",
          icon: MathIcon,
          active: isNodeActive(schema.nodes.math_block),
          visible: setBlockType(schema.nodes.math_block)(state),
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
  if (this.name === "paragraph") {
    clearNodes(view.state, view.dispatch);
    onClose();
    return;
  }
  if (selection instanceof NodeSelection) {
    setBlockType(type, this.attrs)(view.state, view.dispatch);
  }
  onClose();
}

function handleSetBlockListType(view: EditorView, onClose: () => void) {
  const { selection, schema } = view.state;
  const type = schema.nodes[this.name];
  if (selection instanceof NodeSelection) {
    let itemType: NodeType | undefined;
    switch (this.name) {
      case "checkbox_list":
        itemType = schema.nodes.checkbox_item;
      case "bullet_list":
      case "ordered_list":
        itemType = schema.nodes.list_item;
    }
    itemType && toggleList(type, itemType)(view.state, view.dispatch);
  }
  onClose();
}
