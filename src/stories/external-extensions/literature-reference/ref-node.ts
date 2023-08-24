import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Node from "../../../nodes/Node";
import markdownItRef from "./ref-rule";

export default class Ref extends Node {
  get name() {
    return "ref";
  }

  get schema() {
    return {
      group: "inline",
      content: "text*",
      inline: true,
      atom: true,
      selectable: false,
      attrs: {
        name: {
          default: "", // name of reference
        },
      },
      parseDOM: [
        {
          tag: `[class="${this.name}"]`,
          getAttrs: (dom: HTMLElement) => {
            const name = dom.getAttribute("data-name") || "";
            return { name };
          },
        },
      ],
      toDOM: node => [
        "span",
        { class: this.name, "data-name": node.attrs.name },
        0,
      ],
    };
  }

  get plugins() {
    const getLinks = doc => {
      type Reference = { refName: string; refIdx: number; pos: number };
      const decorations: Decoration[] = [];
      const refs: { [refName: string]: number[] } = {};
      const references: { [refName: string]: Reference } = {};
      const referencesArr: Reference[] = [];

      doc.descendants((node, pos) => {
        if (node.type.name === this.name) {
          // ref
          const refName = node.attrs.name;
          if (!refs[refName]) {
            refs[refName] = [];
          }
          refs[refName].push(pos);
          return true;
        }

        if (node.type.name === "literature_reference_item") {
          // reference item
          const refIdx = referencesArr.length;
          const refName = node.attrs.name;
          const refInfo = { refName, refIdx, pos };
          if (!references[refName]) {
            // ignore item with the same name
            references[refName] = refInfo;
          }
          referencesArr.push(refInfo);
        }
      });

      const createRefId = (refName: string, idx: number) => {
        return `literature-ref-${refName}-${idx}`;
      };

      const createReferenceId = (refName: string) => {
        return `literature-reference-${refName}`;
      };

      const createHiddenAnchor = (id: string) => {
        const anchor = document.createElement("span");
        anchor.id = id;
        anchor.className = "hidden-anchor";
        return anchor;
      };

      const createSupLink = (href: string, innerText: string) => {
        const sup = document.createElement("sup");
        const link = document.createElement("a");
        sup.className = "link";
        link.href = href;
        link.innerText = innerText;
        sup.appendChild(link);

        return sup;
      };

      // handle refs
      for (const [refName, posArr] of Object.entries(refs)) {
        const reference = references[refName];

        if (!reference) return;

        const refIdx = reference.refIdx;
        const innerText = `[${refIdx + 1}]`;
        posArr.forEach((pos, idx) => {
          const id = createRefId(refName, idx);
          const decoration = Decoration.widget(
            pos,
            () => {
              const span = document.createElement("span");
              span.className = "widget-ref";

              const anchor = createHiddenAnchor(id);

              const supLink = createSupLink(
                "#" + createReferenceId(refName),
                innerText
              );

              span.appendChild(anchor);
              span.appendChild(supLink);

              return span;
            },
            {
              side: -1,
              key: id,
            }
          );
          decorations.push(decoration);
        });
      }

      // handle references
      referencesArr.forEach(reference => {
        const { refName, refIdx, pos } = reference;
        const id = createReferenceId(refName);
        const decoration = Decoration.widget(
          pos + 1,
          () => {
            const span = document.createElement("span");
            span.className = "widget-reference";

            const refNumber = document.createElement("span");
            refNumber.innerText = `${refIdx + 1}.`;

            const anchor = createHiddenAnchor(id);

            span.appendChild(refNumber);
            span.appendChild(anchor);

            // links
            const posArr = refs[refName];
            if (posArr?.length === 1) {
              const link = document.createElement("a");
              link.href = "#" + createRefId(refName, 0);
              link.innerText = " ↑ ";
              span.appendChild(link);
            } else if (posArr?.length > 1) {
              span.appendChild(document.createTextNode(" ↑ "));
              posArr.forEach((pos, idx) => {
                const supLink = createSupLink(
                  "#" + createRefId(refName, idx),
                  `${refIdx + 1}.${idx + 1}`
                );

                span.appendChild(supLink);
              });
            }

            return span;
          },
          {
            side: -1,
            key: id,
          }
        );
        decorations.push(decoration);
      });

      return DecorationSet.create(doc, decorations);
    };

    const plugin = new Plugin({
      state: {
        init: (config, state) => {
          return getLinks(state.doc);
        },
        apply: (tr, oldState) => {
          return tr.docChanged ? getLinks(tr.doc) : oldState;
        },
      },
      props: {
        decorations: state => {
          return plugin.getState(state);
        },
      },
    });

    return [plugin];
  }

  // 序列化为 markdown 时使用
  toMarkdown(state, node) {
    state.write(`<ref name="${node.attrs.name}"/>`);
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItRef];
  }

  // 把 markdown-it 的解析结果转换成 node
  parseMarkdown() {
    return {
      // prosemirror-markdown 中 tokenHandlers 函数
      // 会根据 token 的类型生成 tokenHandler，
      // 类型有: block/node/mark/ignore.
      node: "ref",
      getAttrs: tok => ({
        name: tok.attrGet("name"),
      }),
    };
  }
}
