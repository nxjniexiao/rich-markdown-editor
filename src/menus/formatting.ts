import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  BlockQuoteIcon,
  LinkIcon,
  StrikethroughIcon,
  OrderedListIcon,
  BulletedListIcon,
  TodoListIcon,
  InputIcon,
  HighlightIcon,
  MathIcon,
  ItalicIcon,
  TableIcon,
  BackIcon,
} from "outline-icons";
import { isInTable } from "prosemirror-tables";
import { EditorState } from "prosemirror-state";
import isInList from "../queries/isInList";
import isMarkActive from "../queries/isMarkActive";
import isNodeActive from "../queries/isNodeActive";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import ColorButton from "../components/ColorButton";

export default function formattingMenuItems(
  state: EditorState,
  isTemplate: boolean,
  dictionary: typeof baseDictionary
): MenuItem[] {
  const { schema } = state;
  const isTable = isInTable(state);
  const isList = isInList(state);
  const allowBlocks = !isTable && !isList;
  const allowMergeCells = isTable;
  const allowSplitCell = isTable;

  let tableCellsOp: MenuItem[] = [];
  if (allowMergeCells || allowMergeCells) {
    tableCellsOp = [
      {
        name: "separator",
      },
      {
        name: "merge_cells",
        tooltip: dictionary.mergeCells,
        icon: TableIcon,
        visible: allowMergeCells,
      },
      {
        name: "split_cell",
        tooltip: dictionary.splitCell,
        icon: TableIcon,
        visible: allowSplitCell,
      },
    ];
  }

  return [
    {
      name: "placeholder",
      tooltip: dictionary.placeholder,
      icon: InputIcon,
      active: isMarkActive(schema.marks.placeholder),
      visible: isTemplate,
    },
    {
      name: "separator",
      visible: isTemplate,
    },
    {
      name: "strong",
      tooltip: dictionary.strong,
      icon: BoldIcon,
      active: isMarkActive(schema.marks.strong),
    },
    {
      name: "em",
      tooltip: dictionary.em,
      icon: ItalicIcon,
      active: isMarkActive(schema.marks.em),
    },
    {
      name: "strikethrough",
      tooltip: dictionary.strikethrough,
      icon: StrikethroughIcon,
      active: isMarkActive(schema.marks.strikethrough),
    },
    {
      name: "highlight",
      tooltip: dictionary.mark,
      icon: HighlightIcon,
      active: isMarkActive(schema.marks.highlight),
      visible: !isTemplate,
    },
    {
      name: "custom",
      tooltip: dictionary.textColor,
      icon: ColorButton,
      visible: !isTemplate,
    },
    {
      name: "code_inline",
      tooltip: dictionary.codeInline,
      icon: CodeIcon,
      active: isMarkActive(schema.marks.code_inline),
    },
    {
      name: "math_inline",
      tooltip: dictionary.equation,
      icon: MathIcon,
      active: isNodeActive(schema.nodes.inline_math),
    },
    {
      name: "html_inline",
      tooltip: dictionary.html,
      icon: BackIcon, // NextIcon
      active: isNodeActive(schema.nodes.inline_html),
    },
    {
      name: "separator",
      visible: allowBlocks,
    },
    {
      name: "heading",
      tooltip: dictionary.heading,
      icon: Heading1Icon,
      active: isNodeActive(schema.nodes.heading, { level: 1 }),
      attrs: { level: 1 },
      visible: allowBlocks,
    },
    {
      name: "heading",
      tooltip: dictionary.subheading,
      icon: Heading2Icon,
      active: isNodeActive(schema.nodes.heading, { level: 2 }),
      attrs: { level: 2 },
      visible: allowBlocks,
    },
    {
      name: "heading",
      tooltip: dictionary.subheading,
      icon: Heading3Icon,
      active: isNodeActive(schema.nodes.heading, { level: 3 }),
      attrs: { level: 3 },
      visible: allowBlocks,
    },
    {
      name: "blockquote",
      tooltip: dictionary.quote,
      icon: BlockQuoteIcon,
      active: isNodeActive(schema.nodes.blockquote),
      attrs: { level: 2 },
      visible: allowBlocks,
    },
    {
      name: "separator",
      visible: allowBlocks || isList,
    },
    {
      name: "checkbox_list",
      tooltip: dictionary.checkboxList,
      icon: TodoListIcon,
      keywords: "checklist checkbox task",
      active: isNodeActive(schema.nodes.checkbox_list),
      visible: allowBlocks || isList,
    },
    {
      name: "bullet_list",
      tooltip: dictionary.bulletList,
      icon: BulletedListIcon,
      active: isNodeActive(schema.nodes.bullet_list),
      visible: allowBlocks || isList,
    },
    {
      name: "ordered_list",
      tooltip: dictionary.orderedList,
      icon: OrderedListIcon,
      active: isNodeActive(schema.nodes.ordered_list),
      visible: allowBlocks || isList,
    },
    {
      name: "separator",
    },
    {
      name: "link",
      tooltip: dictionary.createLink,
      icon: LinkIcon,
      active: isMarkActive(schema.marks.link),
      attrs: { href: "" },
    },
    ...tableCellsOp,
  ];
}
