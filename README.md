# rich-markdown-editor

Forked from [outline/rich-markdown-editor](https://github.com/outline/rich-markdown-editor).

Enhance the outline/rich-markdown-editor by adding new features such as **text color**, **LaTeX**, **merged table cells**, and **HTML**. You can try a live demo [here](https://nxjniexiao.github.io/rich-markdown-editor/).

## Usage

### Install

```
npm i rich-markdown-editor-enhanced
```

### Import

```
import Editor from 'rich-markdown-editor-enhanced';

<Editor
  defaultValue="Hello world!"
/>
```

## New Features

### Text Color and Background Color

Support text color and text background color.

- text color
  ```
  text <<rgb(3, 135, 102) color>> support.
  ```
- text background color
  ```
  text <<<rgba(3, 135, 102, 0.2) background color>>> support.
  ```

### Latex

Support latex.

```
When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$
```

### HTML

Support html block and html inline.

```
## HTML Block

<div>
  <div>123</div>
  <div style="color:skyblue;">456</div>
</div>

## HTML Inline

This span is <span style="background:skyblue">an <span style="border:1px solid red">inline-level</span> element</span>; its background
has been <span style="background:skyblue">colored</span> to <span style="color: tomato">display</span> both the beginning and
<em>end <span style="border: 1px solid #ccc;"> of **the** element's</span> influence</strong>.
```

### Merged Table cells

Support merged table cells.

```
# Tables with merged cells

| Editor      | Rank | React | Collaborative |
|-------------|------|-------|--------------:|
| Prosemirror | Long cell   ||           Yes |
| Slate       | B    |  Yes  |            No |
| ^^          | C    |   No  |           Yes |
```

### Disable Folding

Support disabling the heading folding.

```
import Editor from 'rich-markdown-editor-enhanced';

<Editor 
  disableExtensions=['folding']
/>
```

### IME (extension)

The `onChange` will not be triggered while the input method is composing.

```
import Editor from 'rich-markdown-editor-enhanced';
import IME from 'rich-markdown-editor-enhanced/dist/extensions/ime';

<Editor
  defaultValue="Hello world!"
  onChange={(getValue, getJson) => {
    //...
  }},
  extensions={[
    new IME(),
  ]}
/>
```

### onLoad (extension)

The `onLoad` will be triggered when all the images, formulas, etc. in the editor are loaded.

```
import Editor from 'rich-markdown-editor-enhanced';
import OnLoad from 'rich-markdown-editor-enhanced/dist/extensions/on-load';

<Editor
  defaultValue="Hello world!"
  extensions={[
    new OnLoad({
      onLoad: () => {
        //...
      }
    }),
  ]}
/>
;
```

### attachment (extension)

This extension is just an example showing how to customize nodes.

How to use:

```
import Editor from 'rich-markdown-editor-enhanced';
import Attach from 'rich-markdown-editor-enhanced/dist/extensions/attachment/attachment-node';
import BlockAttach from 'rich-markdown-editor-enhanced/dist/extensions/block-attachment/block-attachment-node';

<Editor
  defaultValue="Hello world!"
  extensions={[
    new Attach(),
    new BlockAttach(),
  ]}
/>
;
```

The syntax of the attachment is as follows:

```
A block level attachment is show as below:

{{block: 9379ed9e-89f1-4196-8280-0881891d8ce8}}

An inline level attachment is show as below:

For details, see attach: [[attach: 9379ed9e-89f1-4196-8280-0881891d8ce8]].
```

### Reference (extension)

Support reference.

How to use:

```
import Editor from 'rich-markdown-editor-enhanced';
import literatureReference from 'rich-markdown-editor-enhanced/dist/extensions/literature-reference/reference-node';
import literatureReferenceItem from 'rich-markdown-editor-enhanced/dist/extensions/literature-reference/reference-item-node';
import Ref from 'rich-markdown-editor-enhanced/dist/extensions/literature-reference/ref-node';

<Editor
  defaultValue="Hello world!"
  extensions={[
    new literatureReference(),
    new literatureReferenceItem(),
    new Ref(),
  ]}
/>
;
```

The syntax of reference is as follows:

```
#### Content

The quick brown fox jumps over the lazy dog.<ref name="LazyDog"/>
Amazingly few discotheques provide jukeboxes.<ref name="Jukeboxes"/>
How razorback-jumping frogs can level six piqued gymnasts.<ref name="JumpingFrogs"/>

#### References

<references>
<ref name="Jukeboxes">This is the jukeboxes reference.</ref>
<ref name="LazyDog">This is the lazy dog reference.</ref>
<ref name="JumpingFrogs">This is the jumping frogs reference.</ref>
</references>
```
