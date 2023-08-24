import Editor from "./index";
import debounce from "lodash/debounce";
import { Props } from "..";
import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import Attach from "./external-extensions/attachment/attachment-node";
import BlockAttach from "./external-extensions/block-attachment/block-attachment-node";
import literatureReference from "./external-extensions/literature-reference/reference-node";
import literatureReferenceItem from "./external-extensions/literature-reference/reference-item-node";
import Ref from "./external-extensions/literature-reference/ref-node";

export default {
  title: "Editor",
  component: Editor,
  argTypes: {
    value: { control: "text" },
    readOnly: { control: "boolean" },
    onSave: { action: "save" },
    onCancel: { action: "cancel" },
    onClickHashtag: { action: "hashtag clicked" },
    onClickLink: { action: "link clicked" },
    onHoverLink: { action: "link hovered" },
    onShowToast: { action: "toast" },
    onFocus: { action: "focused" },
    onBlur: { action: "blurred" },
    disableExtensions: { control: "array" },
  },
  args: {
    disableExtensions: [],
  },
} as Meta;

const Template: Story<Props> = args => <Editor {...args} />;

export const Default = Template.bind({});
Default.args = {
  defaultValue: `# Welcome

Just an easy to use **Markdown** editor with \`slash commands\``,
};

export const Reference = Template.bind({});
Reference.args = {
  extensions: [
    new literatureReference(),
    new literatureReferenceItem(),
    new Ref(),
  ],
  defaultValue: `
# 文献引用

原始的投入产出分析<ref name="Miller"/> 是用于分析经济产品。

全球投入产出表，并且包含环境的数据，可以从这里获得进一步信息<ref name="Dietzenbacher:Data"/>。

<references>
<ref name="Miller"> Miller, R., & Blair, P. (2009). Input–output analysis: Foundations and extensions (2nd ed.). Cambridge, UK: Cambridge University Press.</ref>
<ref name="Dietzenbacher:Data"> Arnold Tukker & Erik Dietzenbacher (2013) GLOBAL MULTIREGIONAL INPUT–OUTPUT FRAMEWORKS: AN INTRODUCTION AND OUTLOOK, Economic Systems Research, 25:1, 1-19, DOI: 10.1080/09535314.2012.761179 </ref>
</references>
  `,
};

export const BlockAttachment = Template.bind({});
BlockAttachment.args = {
  extensions: [new BlockAttach()],
  defaultValue: `
# 自定义块级附件

块级附件
{{cmap: 123}}

附件2

{{cmap: 456}}
`,
};

export const Attachment = Template.bind({});
Attachment.args = {
  extensions: [new Attach()],
  defaultValue: `
# 自定义附件

测试对附件的支持[[[attach: 9379ed9e-89f1-4196-8280-0881891d8ce8]]]，对cmap的支持[[cmap: df53cf6b-eaa9-4f4e-a875-89981f4e1a12]]，以及词条的支持[[[word: b516f615-00ca-4e4d-b24d-1d44179d3167]]。新增加的解析规则不应影响链接[a link](http://www.getoutline.com)。

不应该解析成功的案例测试:

- 类型错误 [[test: 123-abc]]
- 未关闭 [[attach: 123-abc
- 多余空格 [[ attach: 123-abc]]
- 多余空格 [[attach: 123-abc ]]
- ID为中文 [[attach: 中文]]
`,
};

export const Color = Template.bind({});
Color.args = {
  defaultValue: `
# Color

测试特殊情况：[<<rgb(240, 107, 5) 颜色>>，[<<<rgba(163, 67, 31, 0.2) 背景色>>> 。

<<rgb(240, 107, 5) <<<rgba(163, 67, 31, 0.2) **测试**>>>>><<rgb(136, 49, 204) <<<rgba(74, 82, 199, 0.2) ~~文字~~>>>>><<rgb(233, 30, 44) <<<rgba(200, 21, 182, 0.2) *背景*>>>>><<rgb(3, 135, 102) <<<rgba(3, 135, 102, 0.2) 颜色>>>>>
`,
};

export const Math = Template.bind({});
Math.args = {
  defaultValue: `
# 公式

行内公式 $a^2+b^2=c^2$ ，其中 $ 后面跟数字不能被识别为公式，如：$1.99。

当 $a \\ne 0$ 时，$(ax^2 + bx + c = 0)$ 有两个解，它们是：

$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$

$$a \\ne 0$$

公式内包含换行符：

$$x = {-b 
\\pm 
\\sqrt
{b^2-4ac} \\over 2a}$$
`,
};

export const NestedEmphasis = Template.bind({});
NestedEmphasis.args = {
  defaultValue: `
# Nested emphasis

## Render result

支持~~**删除线嵌套加粗**~~的测试。
支持~~删除线嵌套**加粗**~~的测试2。
支持**~~加粗嵌套删除线~~**的测试。
支持**加粗嵌套~~删除线~~**的测试2。
混合~~测试~~：支持~~**删除线嵌套加粗**~~的~~测试~~。
混合**测试**：支持**~~加粗嵌套删除线~~**的**测试**。

## Code

\`\`\`
支持~~**删除线嵌套加粗**~~的测试。
支持~~删除线嵌套**加粗**~~的测试2。
支持**~~加粗嵌套删除线~~**的测试。
支持**加粗嵌套~~删除线~~**的测试2。
混合~~测试~~：支持~~**删除线嵌套加粗**~~的~~测试~~。
混合**测试**：支持**~~加粗嵌套删除线~~**的**测试**。
\`\`\`
`,
};

export const Emoji = Template.bind({});
Emoji.args = {
  defaultValue: `# Emoji

\
:1st_place_medal:
`,
};

export const TemplateDoc = Template.bind({});
TemplateDoc.args = {
  template: true,
  defaultValue: `# Template

This document acts as a "template document", it's possible to insert placeholder marks that can be filled in later by others in a non-template document.

\\
!!This is a template placeholder!!`,
};

export const Headings = Template.bind({});
Headings.args = {
  defaultValue: `# Heading 1

## Heading 2

### Heading 3

#### Heading 4`,
};

export const Lists = Template.bind({});
Lists.args = {
  defaultValue: `# Lists

- An
- Unordered
- List

\\
1. An
1. Ordered
1. List`,
};

export const Blockquotes = Template.bind({});
Blockquotes.args = {
  defaultValue: `# Block quotes

> Quotes are another way to callout text within a larger document
> They are often used to incorrectly attribute words to historical figures`,
};

export const Tables = Template.bind({});
Tables.args = {
  defaultValue: `# Tables

Simple tables with alignment and row/col editing are supported, they can be inserted from the slash menu

| Editor      | Rank | React | Collaborative |
|-------------|------|-------|--------------:|
| Prosemirror | A    |   No  |           Yes |
| Slate       | B    |  Yes  |            No |
| CKEdit      | C    |   No  |           Yes |
`,
};

export const Marks = Template.bind({});
Marks.args = {
  defaultValue: `This document shows the variety of marks available, most can be accessed through the formatting menu by selecting text or by typing out the Markdown manually.

\\
**bold**
_italic_
~~strikethrough~~
__underline__
==highlighted==
\`inline code\`
!!placeholder!!
[a link](http://www.getoutline.com)
`,
};

export const Code = Template.bind({});
Code.args = {
  defaultValue: `# Code

\`\`\`html
<html>
  <p class="content">Simple code blocks are supported</html>
</html>
\`\`\`
`,
};

export const Notices = Template.bind({});
Notices.args = {
  defaultValue: `# Notices

There are three types of editable notice blocks that can be used to callout information:

\\
:::info
Informational
:::

:::tip
Tip
:::

:::warning
Warning
:::
`,
};

export const ReadOnly = Template.bind({});
ReadOnly.args = {
  readOnly: true,
  defaultValue: `# Read Only
  
The content of this editor cannot be edited`,
};

export const MaxLength = Template.bind({});
MaxLength.args = {
  maxLength: 100,
  defaultValue: `This document has a max length of 100 characters. Once reached typing is prevented`,
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  defaultValue: `
- [x] done
- [ ] todo`,
};

export const ReadOnlyWriteCheckboxes = Template.bind({});
ReadOnlyWriteCheckboxes.args = {
  readOnly: true,
  readOnlyWriteCheckboxes: true,
  defaultValue: `A read-only editor with the exception that checkboxes remain toggleable, like GitHub

\\
- [x] done
- [ ] todo`,
};

export const Persisted = Template.bind({});
Persisted.args = {
  defaultValue:
    localStorage.getItem("saved") ||
    `# Persisted
  
The contents of this editor are persisted to local storage on change (edit and reload)`,
  onChange: debounce(value => {
    const text = value();
    localStorage.setItem("saved", text);
  }, 250),
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  defaultValue: "",
  placeholder: "This is a custom placeholder…",
};

export const Images = Template.bind({});
Images.args = {
  defaultValue: `# Images
![A caption](https://upload.wikimedia.org/wikipedia/commons/0/06/Davide-ragusa-gcDwzUGuUoI-unsplash.jpg)`,
};

export const Focused = Template.bind({});
Focused.args = {
  autoFocus: true,
  defaultValue: `# Focused
  
  This editor starts in focus`,
};

export const Dark = Template.bind({});
Dark.args = {
  dark: true,
  defaultValue: `# Dark

There's a customizable dark theme too`,
};

export const RTL = Template.bind({});
RTL.args = {
  dir: "rtl",
  defaultValue: `# خوش آمدید

متن نمونه برای نمایش پشتیبانی از زبان‌های RTL نظیر فارسی، عربی، عبری و ...

\\
- [x] آیتم اول
- [ ] آیتم دوم`,
};
