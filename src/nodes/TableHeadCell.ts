import { DecorationSet, Decoration } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import { isColumnSelected, getCellsInRow } from "prosemirror-utils";
import Node from "./Node";

export default class TableHeadCell extends Node {
  get name() {
    return "th";
  }

  get schema() {
    return {
      content: "paragraph+",
      tableRole: "header_cell",
      isolating: true,
      parseDOM: [
        {
          tag: "th",
          getAttrs: (dom: HTMLElement) => {
            const attrs: { [key: string]: any } = {};
            const colspan = parseInt(dom.getAttribute("colspan") || "");
            const rowspan = parseInt(dom.getAttribute("rowspan") || "");
            const style = dom.getAttribute("style");
            const matches = /text-align: (left|right)/.exec(style || "");
            const alignment = matches?.[1];

            if (!isNaN(colspan)) attrs.colspan = colspan;
            if (!isNaN(rowspan)) attrs.rowspan = rowspan;
            if (alignment) attrs.alignment = alignment;
            return attrs;
          },
        },
      ],
      toDOM(node) {
        const attrs: { [key: string]: any } = {};
        const { colspan, rowspan, alignment } = node.attrs;

        if (colspan !== 1) attrs.colspan = colspan;
        if (rowspan !== 1) attrs.rowspan = rowspan;
        if (alignment) attrs.style = `text-align: ${alignment}`;

        return ["th", attrs, 0];
      },
      attrs: {
        colspan: { default: 1 },
        rowspan: { default: 1 },
        alignment: { default: null },
      },
    };
  }

  toMarkdown() {
    // see: renderTable
  }

  parseMarkdown() {
    return {
      block: "th",
      getAttrs: tok => {
        const { colspan, rowspan, alignment } = tok.meta;
        return { colspan, rowspan, alignment };
      },
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInRow(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection);
                    let className = "grip-column";
                    if (colSelected) {
                      className += " selected";
                    }
                    if (index === 0) {
                      className += " first";
                    } else if (index === cells.length - 1) {
                      className += " last";
                    }
                    const grip = document.createElement("a");
                    grip.className = className;
                    grip.addEventListener("mousedown", event => {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                      this.options.onSelectColumn(index, state);
                    });
                    return grip;
                  })
                );
              });
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
