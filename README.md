# rich-markdown-editor

Forked from [outline/rich-markdown-editor](https://github.com/outline/rich-markdown-editor).

Enhance the outline/rich-markdown-editor by adding new features such as text color, LaTeX, merged table cells, and HTML. You can try a live demo [here](https://nxjniexiao.github.io/rich-markdown-editor/).

## New Features

### Text Color and Background Color

- text color
  ```
  text <<rgb(3, 135, 102) color>> support.
  ```
- text background color
  ```
  text <<<rgba(3, 135, 102, 0.2) background color>>> support.
  ```

### Latex

```
When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$
```

### HTML

Support for html block and html inline.

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

Support for merged table cells.

```
# Tables with merged cells

| Editor      | Rank | React | Collaborative |
|-------------|------|-------|--------------:|
| Prosemirror | Long cell   ||           Yes |
| Slate       | B    |  Yes  |            No |
| ^^          | C    |   No  |           Yes |
```

### Disable Folding

Support for disabling the folding.

```
{
  disableExtensions: ["folding"]
}
```

### IME (external plugin)

Doesn't trigger `onChange` when composing.

### onLoad (external plugin)

The onLoad will be triggered when all the images, formulas, etc. in the editor are loaded.

```
new OnLoad({
  onLoad: () => {
    //...
  }
});
```

### attachment (external plugin)

```
The syntax of the attachment is as follows:

[[attach: df53cf6b-......]]

where `df53cf6b-......` is the attachment id.

Next, we can modify the `component` method in `attachment-node` to define how this custom node is rendered, how it is updated, and how to respond to events.
```

### Reference (external plugin)

```
## Content

The quick brown fox jumps over the lazy dog.<ref name="LazyDog"/>
Amazingly few discotheques provide jukeboxes.<ref name="Jukeboxes"/>
How razorback-jumping frogs can level six piqued gymnasts.<ref name="JumpingFrogs"/>

## References

<references>
<ref name="Jukeboxes">This is the jukeboxes reference.</ref>
<ref name="LazyDog">This is the lazy dog reference.</ref>
<ref name="JumpingFrogs">This is the jumping frogs reference.</ref>
</references>
```
