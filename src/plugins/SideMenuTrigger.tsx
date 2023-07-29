import { NodeSelection, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { debounce } from "lodash";
import Extension from "../lib/Extension";

export default class SideMenuTrigger extends Extension {
  get name() {
    return "sideMenu";
  }

  dragging: boolean;

  sideMenuPos: number;

  nodeType: string; // 拖拽按钮右侧的节点类型

  get plugins() {
    const button = document.createElement("button");
    button.className = "block-menu-trigger side-menu-trigger";
    button.type = "button";
    button.draggable = true;
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-id="43m1fqhQ7JY2syHTcx97a8" data-area="hover-menu"><path fill="#BCB3B3" d="M8.389 13.824c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm7.2 0c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm0-7.2c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm-7.2 0c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8z"></path></svg>`;

    button.addEventListener("mousedown", () => {
      const editorView = this.editor.view;
      editorView.dispatch(
        editorView.state.tr.setSelection(
          NodeSelection.create(editorView.state.doc, this.sideMenuPos)
        )
      );

      this.dragging = true;

      const handleDragStart = event => {
        // 拖拽按钮渲染在 heading 节点内部，不需要手动设置 drag image
        if (event.target && event.dataTransfer && this.nodeType !== "heading") {
          const dom = event.target.nextSibling;
          if (dom) event.dataTransfer.setDragImage(dom, 0, 0);
        }
      };
      const resetDragging = () => {
        this.dragging = false;
        document.removeEventListener("dragstart", handleDragStart);
        document.removeEventListener("drop", resetDragging);
        document.removeEventListener("mouseup", resetDragging);
      };
      document.addEventListener("dragstart", handleDragStart);
      document.addEventListener("drop", resetDragging);
      document.addEventListener("mouseup", resetDragging);
    });

    button.addEventListener("click", () => {
      this.options.onOpen(button);
    });

    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, value, oldState, newState) {
            const sideMenu = tr.getMeta("sideMenu");
            if (sideMenu !== undefined) {
              // 拖拽按钮渲染在 heading 节点内部
              const pos =
                sideMenu.nodeType === "heading"
                  ? sideMenu.pos + 1
                  : sideMenu.pos;
              return DecorationSet.create(newState.doc, [
                Decoration.widget(pos, () => {
                  return button;
                }),
              ]);
            } else {
              return value;
            }
          },
        },
        props: {
          handleClick: (view, pos, e) => {
            const target = e.target as Element;
            if (target?.closest(".side-menu-trigger")) return true;
            this.options.onClose();
            return false;
          },
          handleDOMEvents: {
            mouseover: debounce((view: EditorView, event) => {
              if (this.dragging) return;
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (!pos) return;
              const resolvedPos = view.state.doc.resolve(
                pos.inside === -1 ? pos.pos : pos.inside // fix wrong pos when hover on block with custom node view
              );
              const index = resolvedPos.start(1) - 1;

              if (index !== this.sideMenuPos) {
                const resolved = view.state.doc.resolve(index);
                this.nodeType = resolved.nodeAfter?.type.name || "";
                this.sideMenuPos = index;
                view.dispatch(
                  view.state.tr.setMeta("sideMenu", {
                    pos: this.sideMenuPos,
                    nodeType: this.nodeType,
                  })
                );
              }
              return false;
            }, 50),
          },
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  }
}
