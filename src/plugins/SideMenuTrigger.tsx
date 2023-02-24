import { NodeSelection, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { debounce } from "lodash";
import Extension from "../lib/Extension";

export default class SideMenuTrigger extends Extension {
  get name() {
    return "sideMenu";
  }

  sideMenuPos: number;

  get plugins() {
    const button = document.createElement("button");
    button.className = "block-menu-trigger side-menu-trigger";
    button.type = "button";
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-id="43m1fqhQ7JY2syHTcx97a8" data-area="hover-menu"><path fill="#BCB3B3" d="M8.389 13.824c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm7.2 0c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm0-7.2c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8zm-7.2 0c1.026 0 1.809.786 1.809 1.8 0 .979-.818 1.8-1.81 1.8a1.81 1.81 0 01-1.79-1.8c0-.996.808-1.8 1.79-1.8z"></path></svg>`;

    button.addEventListener("mousedown", () => {
      const editorView = this.editor.view;
      editorView.dispatch(
        editorView.state.tr.setSelection(
          NodeSelection.create(editorView.state.doc, this.sideMenuPos - 1)
        )
      );
    });

    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, value, oldState, newState) {
            const sideMenuPos = tr.getMeta("sideMenuPos");
            if (sideMenuPos !== undefined) {
              return DecorationSet.create(newState.doc, [
                Decoration.widget(sideMenuPos, () => {
                  return button;
                }),
              ]);
            } else {
              return value;
            }
          },
        },
        props: {
          handleDOMEvents: {
            mouseover: debounce((view, event) => {
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (!pos) return;
              const resolvedPos = view.state.doc.resolve(pos.pos);
              const index = resolvedPos.start(1);
              if (index !== this.sideMenuPos) {
                this.sideMenuPos = index;
                view.dispatch(view.state.tr.setMeta("sideMenuPos", index));
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
