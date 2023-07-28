import React from "react";
import Node from "../../../nodes/Node";
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
          default: "", // cmap
        },
        id: {
          default: "", // block attachment id
        },
      },
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
          getAttrs: (dom: HTMLIFrameElement) => {
            const type = dom.getAttribute("data-type") || "";
            const id = dom.getAttribute("data-id") || "";
            return { type, id };
          },
        },
      ],
      toDOM: node => [
        "div",
        {
          class: this.name,
          "data-type": node.attrs.type,
          "data-id": node.attrs.id,
        },
        0,
      ],
    };
  }

  component = props => {
    return <BlockAttachmentComp {...props} />;
  };

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.ensureNewLine();
    state.write(`{{${node.attrs.type}: ${node.attrs.id}}}`);
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
      }),
    };
  }
}

function BlockAttachmentComp(props) {
  const { isSelected } = props;
  const { type, id } = props.node.attrs;
  const [attachmentData, setAttachmentData] = React.useState<any>({});

  React.useEffect(() => {
    // api request
    setAttachmentData({
      name: "自定义块级附件",
    });
  }, [type, id]);

  return (
    <div className={isSelected ? "ProseMirror-selectednode" : ""}>
      {attachmentData.name}
    </div>
  );
}
