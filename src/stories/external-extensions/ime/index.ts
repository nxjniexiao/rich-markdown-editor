import { Plugin, PluginKey } from "prosemirror-state";
import Extension from "../../../lib/Extension";

export const imePluginKey = new PluginKey("ime");

export default class IME extends Extension {
  get name() {
    return "ime";
  }

  get plugins() {
    return [
      new Plugin({
        key: imePluginKey,
        props: {
          handleDOMEvents: {
            compositionend(view) {
              view.dispatch(view.state.tr.setMeta("compositionend", true));
            },
          },
        },
      }),
    ];
  }
}
