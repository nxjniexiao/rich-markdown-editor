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
import OnLoad from "./external-extensions/on-load";
import IME from "./external-extensions/ime";

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

export const HTML = Template.bind({});
HTML.args = {
  defaultValue: `# HTML

## HTML block

<div>
  <div>123</div>
  <div style="color:skyblue;">456</div>
</div>

## HTML inline

This span is <span style="background:skyblue">an <span style="border:1px solid red">inline-level</span> element</span>; its background 
has been <span style="background:skyblue">colored</span> to <span style="color: tomato">display</span> both the beginning and
<em>end <span style="border: 1px solid #ccc;"> of **the** element's</span> influence</strong>.
`,
};

export const DisableFolding = Template.bind({});
DisableFolding.args = {
  disableExtensions: ["folding"],
  defaultValue: `# Disable folding

Just an easy to use **Markdown** editor with \`slash commands\``,
};

export const InputMethod = Template.bind({});
InputMethod.args = {
  extensions: [new IME()],
  defaultValue: `# IME

onChange should not be triggered within a composition session`,
};

export const Reference = Template.bind({});
Reference.args = {
  readOnly: true,
  onClickLink: (href: string) => {
    let openInNewTab = true;
    try {
      const url = new URL(href);
      if (url.hash.startsWith("#literature")) {
        openInNewTab = false;
      }
    } catch (_) {}
    openInNewTab ? window.open(href, "_blank") : (window.location.href = href);
  },
  extensions: [
    new literatureReference(),
    new literatureReferenceItem(),
    new Ref(),
  ],
  defaultValue: `
# Content

XXXXXXXXXXXXXXX1<ref name="Miller"/><ref name="Davis"/> XXXXXXXXXXXXXXX2<ref name="Miller"/>。

1

2

XXXXXXXXXXXXXXX3<ref name="Miller"/> X2<ref name="Davis"/>

3

4

5

XXXXXXXXXXXXXXX4<ref name="Miller"/> X3<ref name="Davis"/>

6

7

8

9

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX<ref name="Dietzenbacher:Data"/>。

1

2

3

4

5

6

7

8

9

## References

<references>
<ref name="Miller"> Miller, R., & Blair, P. (2009). Input–output analysis: Foundations and extensions (2nd ed.). Cambridge, UK: Cambridge University Press.</ref>
<ref name="Davis"> Davis S. & Caldeira K. (2010). Consumption-based accounting of CO2 emmissions. PNAS 107(12):5687-5692.</ref>
<ref name="Dietzenbacher:Data"> Arnold Tukker & Erik Dietzenbacher (2013) GLOBAL MULTIREGIONAL INPUT–OUTPUT FRAMEWORKS: AN INTRODUCTION AND OUTLOOK, Economic Systems Research, 25:1, 1-19, DOI: 10.1080/09535314.2012.761179 </ref>
</references>
  `,
};

export const BlockAttachment = Template.bind({});
BlockAttachment.args = {
  extensions: [new BlockAttach()],
  defaultValue: `
# Custom Block Attachment

Block Attachment
{{block: 9379ed9e-89f1-4196-8280-0881891d8ce8}}

Attachment 2

{{block: df53cf6b-eaa9-4f4e-a875-89981f4e1a12}}

Attachment 3 with height

{{block: df53cf6b-eaa9-4f4e-a875-89981f4e1a12|auto|100px}}

Attachment 4 with width

{{block: df53cf6b-eaa9-4f4e-a875-89981f4e1a12|150.5px|100px}}
`,
};

export const Attachment = Template.bind({});
Attachment.args = {
  extensions: [new Attach()],
  defaultValue: `
# Custom Inline Attachment

Test support for attachments[[[attach: 9379ed9e-89f1-4196-8280-0881891d8ce8]]]. New rules should not affect links[a link](http://www.getoutline.com)。

Shouldn't Parse Successful Case Tests:

- wrong key word [[test: 123-abc]]
- un-closed [[attach: 123-abc
- extra space [[ attach: 123-abc]]
- extra space [[attach: 123-abc ]]
- wrong id [[attach: 中文]]
`,
};

export const OnLoadProps = Template.bind({});
OnLoadProps.args = {
  extensions: [
    new Attach(),
    new OnLoad({
      onLoad: () => {
        const root = document.querySelector("#root");
        console.log(
          `width: ${root?.offsetWidth}; height: ${root?.offsetHeight}`
        );
      },
    }),
  ],
  defaultValue: `# OnLoad

Attachment [[attach: 9379ed9e-89f1-4196-8280-0881891d8ce8]]]。

![A caption](https://upload.wikimedia.org/wikipedia/commons/0/06/Davide-ragusa-gcDwzUGuUoI-unsplash.jpg)

when $a \\ne 0$, $(ax^2 + bx + c = 0)$ has two solutions, which are：

$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$

`,
};

export const Color = Template.bind({});
Color.args = {
  defaultValue: `
# Color

Special case：[<<rgb(240, 107, 5) Color>>，[<<<rgba(163, 67, 31, 0.2) Background Color>>> 。

<<rgb(240, 107, 5) <<<rgba(163, 67, 31, 0.2) **Test**>>>>><<rgb(136, 49, 204) <<<rgba(74, 82, 199, 0.2) ~~Text~~>>>>><<rgb(233, 30, 44) <<<rgba(200, 21, 182, 0.2) *Background*>>>>><<rgb(3, 135, 102) <<<rgba(3, 135, 102, 0.2) Color>>>>>
`,
};

export const Math = Template.bind({});
Math.args = {
  defaultValue: `
# Math

Inline math $a^2+b^2=c^2$ ，where $ followed by a number cannot be recognized as a formula, eg：$1.99。

when $a \\ne 0$ 时，$(ax^2 + bx + c = 0)$ has two solutions, which are：

$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$

$$a \\ne 0$$

Line breaks are included in the formula:

$$x = {-b 
\\pm 
\\sqrt
{b^2-4ac} \\over 2a}\\text{文字}$$
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
| Slate       | B    |  Yes  |     No \\n No |
| CKEdit      | C    |   No  |           Yes |
`,
};

export const TablesWithMergedCells = Template.bind({});
TablesWithMergedCells.args = {
  defaultValue: `# Tables with merged cells

## Multiple columns spanned, without leading pipes

|               |          Grouping           ||
| First Header  | Second Header | Third Header |
| ------------- | :-----------: | -----------: |
| Content       |          *Long Cell*        ||
| Content       |   **Cell**    |         Cell |

## Empty table cells at headers and data rows

|             |                             ||
|             | Second Header | Third Header |
| ----------- | :-----------: | -----------: |
| Content     |                             ||
|             |               |         Cell |

## Rowspan and colspan in one table cell

| A                |||
|------|------|------|
| B    | C    | D    |
| ^^   | E    | F    |
| G          || H    |
| ^^         || I    |
| ^^         || J    |

## Rowspan and colspan in one table cell base case

|    |    |    |
|----|----|----|
| A  | B      ||
| C  | ^^     ||

## Rowspan at first line

| ^^   | A    | B    |
|------|------|------|
| ^^   | C    | D    |
| ^^   | E    | F    |
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
