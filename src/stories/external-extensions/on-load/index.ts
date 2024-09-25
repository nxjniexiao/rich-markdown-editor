import { Plugin } from "prosemirror-state";
import Extension from "../../../lib/Extension";

export default class OnLoad extends Extension {
  get name() {
    return "on_load";
  }

  get plugins() {
    let noItemsToWaitForLoading = false;
    let loaded = false; // all loaded flag
    const images = new LoadStatus(); // image load status
    const math = new LoadStatus(); // math load status
    const inlineAttachments = new LoadStatus(); // inline attachments load status

    return [
      new Plugin({
        view: () => {
          // When there are no images/math/attachments to load, call onLoad with a delay.
          if (noItemsToWaitForLoading) {
            setTimeout(() => {
              this.options.onLoad?.();
            }, 10);
          }
          return {};
        },
        state: {
          init: (config, state) => {
            state.doc.descendants((node, pos) => {
              if (node.type.name === "image") {
                images.initItem(pos);
              } else if (
                node.type.name === "math_block" ||
                node.type.name === "math_inline"
              ) {
                math.initItem(pos);
              } else if (node.type.name === "attachment") {
                inlineAttachments.initItem(pos);
              }
            });

            images.updateLoaded();
            math.updateLoaded();
            inlineAttachments.updateLoaded();
            loaded = images.loaded && math.loaded && inlineAttachments.loaded;
            noItemsToWaitForLoading = loaded;

            return loaded;
          },
          apply: tr => {
            if (!loaded) {
              const loadImage = tr.getMeta("load-image");
              const loadMath = tr.getMeta("load-math");
              const loadInlineAttachment = tr.getMeta("load-inline-attachment");
              if (loadImage) {
                images.loadItem(loadImage.pos);
              } else if (loadMath) {
                math.loadItem(loadMath.pos);
              } else if (loadInlineAttachment) {
                inlineAttachments.loadItem(loadInlineAttachment.pos);
              }
              loaded = images.loaded && math.loaded && inlineAttachments.loaded;
              if (loaded) {
                this.options.onLoad?.();
              }
              return loaded;
            }
            return true;
          },
        },
      }),
    ];
  }
}

class LoadStatus {
  loaded: boolean;

  items: { [pos: number]: boolean };

  constructor() {
    this.loaded = false;
    this.items = {};
  }

  initItem(pos: number) {
    this.items[pos] = false;
  }

  loadItem(pos: number) {
    if (pos in this.items) {
      this.items[pos] = true;
      this.updateLoaded();
    }
  }

  updateLoaded() {
    if (this.areAllItemsLoaded()) {
      this.loaded = true;
    }
  }

  areAllItemsLoaded() {
    return Object.values(this.items).every(loaded => loaded);
  }
}
