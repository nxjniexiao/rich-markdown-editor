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
  BackIcon,
} from "outline-icons";
import { EditorView } from "prosemirror-view";
import { NodeType, Slice } from "prosemirror-model";
import { EditorState, NodeSelection, TextSelection } from "prosemirror-state";
import { setBlockType, wrapIn } from "prosemirror-commands";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import isNodeActive from "../queries/isNodeActive";
import toggleList from "../commands/toggleList";
import clearNodes from "../commands/clearNodes";

export default function sideMenuItems(arg: {
  dictionary: typeof baseDictionary;
  state: EditorState;
}): MenuItem[] {
  const { dictionary, state } = arg;
  const { schema } = state;
  let isTable = false;
  let isParagraph = false;
  if (state.selection instanceof NodeSelection) {
    const name = state.selection.node.type.name;
    isTable = name === "table";
    isParagraph = name === "paragraph";
  }

  const items = [
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
          visible: isParagraph,
          onClick: handleSetBlockListType,
        },
        {
          name: "bullet_list",
          title: dictionary.bulletList,
          keywords: "bullet list",
          icon: BulletedListIcon,
          active: isNodeActive(schema.nodes.bullet_list),
          visible: isParagraph,
          onClick: handleSetBlockListType,
        },
        {
          name: "ordered_list",
          title: dictionary.orderedList,
          keywords: "ordered list",
          icon: OrderedListIcon,
          active: isNodeActive(schema.nodes.ordered_list),
          visible: isParagraph,
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
        // BLOCK HTML
        {
          name: "html_block",
          title: dictionary.blockHTML,
          keywords: "Block HTML",
          icon: BackIcon,
          active: isNodeActive(schema.nodes.html_block),
          visible: setBlockType(schema.nodes.html_block)(state),
          onClick: handleSetBlockType,
        },
      ],
    },
  ];

  if (isTable) {
    const item = items.find(item => item.name === "turn_into");
    if (item) item.subMenus = [];
  }

  return items;
}

function handleDeleteBlock(view: EditorView, onClose: () => void) {
  let tr = view.state.tr;
  tr = tr.replaceSelection(Slice.empty);
  view.dispatch(tr);
  view.focus();
  onClose();
}

function handleDuplicateBlock(view: EditorView, onClose: () => void) {
  let tr = view.state.tr;
  const selection = view.state.selection;
  tr = tr.replace(selection.from, selection.from, selection.content());
  view.dispatch(tr);
  view.focus();
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
    view.focus();
    onClose();
    return;
  }
  if (selection instanceof NodeSelection) {
    // fix: change type to blockquote failed
    if (type === schema.nodes.blockquote) {
      wrapIn(type, this.attrs)(view.state, view.dispatch);
    } else if (type === schema.nodes.html_block) {
      const node = type.create(
        null,
        schema.text(`<div>\n${selection.node.textContent || "..."}\n</div>`)
      );
      let tr = view.state.tr.replaceSelectionWith(node);
      tr = tr.setSelection(
        NodeSelection.create(
          tr.doc,
          tr.selection.$from.before() - node.nodeSize
        )
      );
      view.dispatch(tr.scrollIntoView());
    } else {
      setBlockType(type, this.attrs)(view.state, view.dispatch);
    }
    view.focus();
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
  view.focus();
  onClose();
}
