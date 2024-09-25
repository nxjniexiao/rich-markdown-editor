import { DecorationSet, Decoration } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import {
  isTableSelected,
  isRowSelected,
  getCellsInColumn,
} from "prosemirror-utils";
import Node from "./Node";

export default class TableCell extends Node {
  get name() {
    return "td";
  }

  get schema() {
    return {
      content: "paragraph+",
      tableRole: "cell",
      isolating: true,
      parseDOM: [
        {
          tag: "td",
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

        return ["td", attrs, 0];
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
      block: "td",
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
            const cells = getCellsInColumn(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                if (index === 0) {
                  decorations.push(
                    Decoration.widget(pos + 1, () => {
                      let className = "grip-table";
                      const selected = isTableSelected(selection);
                      if (selected) {
                        className += " selected";
                      }
                      const grip = document.createElement("a");
                      grip.className = className;
                      grip.addEventListener("mousedown", event => {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        this.options.onSelectTable(state);
                      });
                      return grip;
                    })
                  );
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);

                    let className = "grip-row";
                    if (rowSelected) {
                      className += " selected";
                    }
                    if (index === 0) {
                      className += " first";
                    }
                    if (index === cells.length - 1) {
                      className += " last";
                    }
                    const grip = document.createElement("a");
                    grip.className = className;
                    grip.addEventListener("mousedown", event => {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                      this.options.onSelectRow(index, state);
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
