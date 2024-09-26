import React, { CSSProperties } from "react";
import Node from "../../nodes/Node";
import markdownItBlockAttachment from "./block-attachment-rule";

export default class Attachment extends Node {
  get name() {
    return "block_attachment";
  }

  get schema() {
    return {
      group: "block",
      content: "text*",
      atom: true,
      attrs: {
        type: {
          default: "", // block
        },
        id: {
          default: "", // block attachment id
        },
        width: {
          default: "",
        },
        height: {
          default: "",
        },
      },
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
          getAttrs: (dom: HTMLIFrameElement) => {
            const type = dom.getAttribute("data-type") || "";
            const id = dom.getAttribute("data-id") || "";
            const width = dom.getAttribute("data-width") || "";
            const height = dom.getAttribute("data-height") || "";
            return { type, id, width, height };
          },
        },
      ],
      toDOM: node => [
        "div",
        {
          class: this.name,
          "data-type": node.attrs.type,
          "data-id": node.attrs.id,
          "data-width": node.attrs.width,
          "data-height": node.attrs.height,
        },
        0,
      ],
    };
  }

  stopEvent(event) {
    // Don't stop drop event
    const isDropEvent = event.type === "drop";
    return isDropEvent ? false : true;
  }

  component = props => {
    return <BlockAttachmentComp {...props} />;
  };

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    const { type, id, width, height } = node.attrs;
    const size = width && height ? `|${width}|${height}` : "";
    state.ensureNewLine();
    state.write(`{{${type}: ${id}${size}}}`);
    state.closeBlock(node);
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItBlockAttachment];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "block_attachment",
      getAttrs: tok => ({
        type: tok.attrGet("type"),
        id: tok.attrGet("id"),
        width: tok.attrGet("width"),
        height: tok.attrGet("height"),
      }),
    };
  }
}

function BlockAttachmentComp(props) {
  const { isSelected } = props;
  const { type, id, width, height } = props.node.attrs;
  const [attachmentData, setAttachmentData] = React.useState<any>({});

  const style: CSSProperties = { background: "skyblue" };

  if (width) style.width = width;
  if (height) style.height = height;

  const allowDrag = e => {
    // prevent default to allow drop
    e.preventDefault();
  };

  React.useEffect(() => {
    // api request
    setAttachmentData({
      name: "自定义块级附件",
    });
  }, [type, id]);

  return (
    <div
      className={`block-attachment ${
        isSelected ? " ProseMirror-selectednode" : ""
      }`}
      style={style}
      onDragOver={allowDrag}
    >
      {attachmentData.name}
    </div>
  );
}
