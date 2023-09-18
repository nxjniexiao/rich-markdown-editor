import React from "react";
import Node from "../../../nodes/Node";
import markdownItAttachment from "./attachment-rule";

export default class Attachment extends Node {
  get name() {
    return "attachment";
  }

  get schema() {
    return {
      group: "inline",
      content: "text*",
      inline: true,
      atom: true,
      selectable: false,
      attrs: {
        type: {
          default: "", // cmap | word | attach
        },
        id: {
          default: "", // attachment id
        },
      },
      parseDOM: [
        {
          tag: `[class="${this.name}"`,
          getAttrs: (dom: HTMLIFrameElement) => {
            const type = dom.getAttribute("data-type") || "";
            const id = dom.getAttribute("data-id") || "";
            return { type, id };
          },
        },
      ],
      toDOM: node => [
        "span",
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
    return <AttachmentComp {...props} editor={this.editor} />;
  };

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write("[[");
    state.text(node.attrs.type, false);
    state.text(": ", false);
    state.text(node.attrs.id, false);
    state.write("]]");
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItAttachment];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "attachment",
      getAttrs: tok => ({
        type: tok.attrGet("type"),
        id: tok.attrGet("id"),
      }),
    };
  }
}

function AttachmentComp(props) {
  const { editor, node, getPos } = props;
  const { type, id } = node.attrs;
  const [attachmentData, setAttachmentData] = React.useState<any>({});

  const handleClick = () => {
    // handle click
    window.open("https://cn.bing.com");
  };

  React.useEffect(() => {
    // api request
    setAttachmentData({
      name: "文件名",
    });
    requestAnimationFrame(() => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta("load-inline-attachment", {
          pos: getPos(),
        })
      );
    });
  }, [type, id]);

  return (
    <a href="javascript:;" onClick={handleClick}>
      {attachmentData.name}
    </a>
  );
}
