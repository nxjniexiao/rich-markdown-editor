import { Node, Schema } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { undo, redo } from "prosemirror-history";
import {
  chainCommands,
  deleteSelection,
  newlineInCode,
} from "prosemirror-commands";
import { sanitizeBlockHtml, sanitizeInlineHtml } from "./sanitize-html";
import { GetPos, isMacOS } from "./types";

import "./style.css";

export class HTMLView implements NodeView {
  dom: HTMLElement;

  htmlEditor: HTMLElement;

  htmlContent: HTMLElement;

  inline: boolean;

  // These are used when the footnote is selected
  innerView: EditorView;

  node: Node;

  outerView: EditorView;

  getPos: GetPos;

  constructor(node: Node, view: EditorView, getPos: GetPos, inline: boolean) {
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;
    this.dom = document.createElement(inline ? "span" : "div");
    this.dom.classList.add("html");
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.htmlEditor = document.createElement(inline ? "span" : "div");
    this.htmlEditor.classList.add("html-editor");
    this.htmlContent = document.createElement(inline ? "span" : "div");
    this.htmlContent.classList.add("html-content");
    this.htmlContent.addEventListener("click", () => {
      if (!view.editable) return;
      this.select();
    });
    this.dom.appendChild(this.htmlEditor);
    this.dom.appendChild(this.htmlContent);
    this.inline = inline;

    if (this.inline) {
      this.dom.classList.add("inline");
      this.htmlEditor.classList.add("inline");
    } else {
      this.dom.classList.add("display");
    }

    this.addFakeCursor();
    this.dom.classList.remove("editing");
    this.renderHTML();

    const unFocus = () => {
      this.dom.classList.remove("editing");
      this.outerView.focus();
      return true;
    };

    const mac = isMacOS();

    const doc = createHTMLEditorDoc(view.state.schema, this.node.attrs.content);
    this.innerView = new EditorView(
      { mount: this.htmlEditor },
      {
        state: EditorState.create({
          doc,
          plugins: [
            keymap({
              "Mod-a": () => {
                const { doc, tr } = this.innerView.state;
                const sel = TextSelection.create(doc, 0, doc.content.size);
                this.innerView.dispatch(tr.setSelection(sel));
                return true;
              },
              "Mod-z": () =>
                undo(this.outerView.state, this.outerView.dispatch),
              "Mod-Z": () =>
                redo(this.outerView.state, this.outerView.dispatch),
              ...(mac
                ? {}
                : {
                    "Mod-y": () =>
                      redo(this.outerView.state, this.outerView.dispatch),
                  }),
              Escape: unFocus,
              Tab: unFocus,
              "Shift-Tab": unFocus,
              Enter: unFocus,
              "Ctrl-Enter": chainCommands(newlineInCode, unFocus),
              "Shift-Enter": chainCommands(newlineInCode, unFocus),

              Backspace: chainCommands(deleteSelection, state => {
                // default backspace behavior for non-empty selections
                if (!state.selection.empty) {
                  return false;
                }
                // default backspace behavior when math node is non-empty
                if (this.node.attrs.content.length > 0) {
                  return false;
                }
                // otherwise, we want to delete the empty math node and focus the outer view
                this.outerView.dispatch(this.outerView.state.tr.insertText(""));
                this.outerView.focus();
                return true;
              }),
            }),
          ],
        }),

        dispatchTransaction: this.dispatchInner.bind(this),
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.
            if (this.outerView.hasFocus()) this.innerView.focus();
            return false;
          },
        },
      }
    );
  }

  update(node: Node) {
    if (this.node.type !== node.type) return false;
    this.node = node;
    this.addFakeCursor();
    this.renderHTML();

    const newContent = node.attrs.content;
    const currContent = getContentFromHTMLEditorDoc(this.innerView.state.doc);
    // we don't need to update inner editor view when the content has not changed
    if (newContent === currContent) return true;

    if (this.innerView) {
      const { state } = this.innerView;
      const newDoc = createHTMLEditorDoc(state.schema, newContent);
      const start = newDoc.content.findDiffStart(state.doc.content);
      if (start != null) {
        const ends = newDoc.content.findDiffEnd(state.doc.content as any);
        let { a: endA, b: endB } = ends ?? { a: 0, b: 0 };
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, newDoc.slice(start, endA))
            .setMeta("fromOutside", true)
        );
      }
    }
    return true;
  }

  dispatchInner(tr: Transaction) {
    const { state } = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta("fromOutside") && tr.docChanged) {
      const outerTr = this.outerView.state.tr;
      const content = getContentFromHTMLEditorDoc(state.doc);
      outerTr.setNodeMarkup(this.getPos(), undefined, {
        content,
      });
      if (outerTr.docChanged) {
        this.outerView.dispatch(outerTr);
      }
    }
  }

  renderHTML() {
    const content = this.node.attrs.content.trim() || "...";
    const safeContent = this.inline
      ? sanitizeInlineHtml(content)
      : sanitizeBlockHtml(content);
    this.htmlContent.innerHTML = safeContent;
  }

  destroy() {
    this.innerView.destroy();
    this.dom.textContent = "";
  }

  stopEvent(event: any): boolean {
    return (
      (this.innerView && this.innerView.dom.contains(event.target)) ?? false
    );
  }

  ignoreMutation() {
    return true;
  }

  addFakeCursor() {
    if (!this.inline) return;
    const hasContent = this.node.textContent.length > 0;
    this.htmlEditor.classList[hasContent ? "remove" : "add"]("empty");
  }

  select() {
    this.dom.classList.add("ProseMirror-selectedNode");
    this.dom.classList.add("editing");
    // This is necessary on first insert.
    setTimeout(() => this.innerView.focus(), 1);
    document.addEventListener("click", this.handleDocumentClick);
  }

  deselect() {
    this.dom.classList.remove("ProseMirror-selectedNode");
    this.dom.classList.remove("editing");
    document.removeEventListener("click", this.handleDocumentClick);
  }

  handleDocumentClick(event) {
    const target = event.target;
    const htmlDom = target?.closest(".html");
    if (htmlDom === this.dom) return;
    this.deselect();
  }
}

// create inner editor doc by html string
function createHTMLEditorDoc(schema: Schema, html: string) {
  const doc = schema.nodeFromJSON({
    type: "html_block",
    content: html ? [{ type: "text", text: html }] : [],
  });

  return doc;
}

// get content from html editor doc
function getContentFromHTMLEditorDoc(doc: Node) {
  const content = doc.textContent;

  return content;
}
