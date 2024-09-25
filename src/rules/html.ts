import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

export const validInlineHtmlPairs = [
  "a",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "del",
  "s",
  "ins",
  "u",
  "code",
  "kbd",
  "var",
  "abbr",
  "cite",
  "q",
  "sup",
  "sub",
  "time",
];
const validInlineHtmlPairsSet = new Set(validInlineHtmlPairs);

const INLINE_HTML_REGEX_START = /^<(\w+)[\s>]/;
const INLINE_HTML_REGEX_END = /^<\/(\w+)>/;

export default function html(md: MarkdownIt): void {
  // post-processing for block html
  md.core.ruler.after("block", "blockHtml", state => {
    const tokens = state.tokens;
    let i = tokens.length;
    while (i--) {
      const token = tokens[i];
      if (token.type === "html_block") {
        const openToken = new Token("html_block_open", "", 1);
        const textToken = new Token("text", "", 0);
        const closeToken = new Token("html_block_close", "", -1);
        textToken.content = token.content;
        tokens.splice(i, 1, openToken, textToken, closeToken);
      }
    }
  });

  // post-processing for inline html pairs
  md.inline.ruler2.after("emphasis", "inlineHtml", state => {
    const tokens = state.tokens;
    const max = tokens.length;
    const validInlineHtmlTokenObj: { [tag: string]: number[] } = {};
    let i = 0;
    let token: Token;

    // find all valid inner html
    for (i = 0; i < max; i++) {
      token = tokens[i];
      if (token.type === "html_inline") {
        const startMatch = INLINE_HTML_REGEX_START.exec(token.content);
        const endMatch = INLINE_HTML_REGEX_END.exec(token.content);
        const match = startMatch || endMatch;

        if (match) {
          const tag = match[1];
          const isValidTag = validInlineHtmlPairsSet.has(tag);
          if (isValidTag) {
            let idxArr = validInlineHtmlTokenObj[tag];
            if (!idxArr) {
              idxArr = validInlineHtmlTokenObj[tag] = [];
            }
            idxArr.push(i);
            token.tag = tag;
            token.nesting = startMatch ? 1 : -1;
          } else {
            token.type = "text";
          }
        }
      }
    }

    const hasHtmlInline = Object.keys(validInlineHtmlTokenObj).length > 0;
    if (!hasHtmlInline) return;

    // try to find the longest inline html pairs.
    // ...<span>1 <span>2</span> 3</span>...
    const findEndTokenIdx = (tag: string, startIdx: number) => {
      const idxArr = validInlineHtmlTokenObj[tag];
      if (!idxArr) return null;

      let extraStartTokenCount = 0;
      let res: number | null = null;

      for (let i = 0; i < idxArr.length; i++) {
        const idx = idxArr[i];

        if (idx <= startIdx) continue;

        const token = tokens[idx];
        if (token.nesting === -1) {
          res = idx;
          if (extraStartTokenCount > 0) {
            extraStartTokenCount--;
            continue;
          } else {
            break;
          }
        } else {
          // when additional start tokens are present,
          // extraStartTokenCount is increased by 1
          extraStartTokenCount++;
        }
      }

      return res;
    };
    // pair inner html and create new tokens
    const newTokens: Token[] = [];
    for (i = 0; i < max; i++) {
      token = tokens[i];
      newTokens.push(token);
      if (token.type === "html_inline") {
        if (token.nesting !== 1) {
          token.nesting = 0;
          token.type = "text";
          continue;
        }
        const endTokenIdx = findEndTokenIdx(token.tag, i);
        if (endTokenIdx === null) {
          token.nesting = 0;
          token.type = "text";
        } else {
          token.type = "html_inline_open";
          let content = "";
          for (let j = i; j <= endTokenIdx; j++) {
            content += tokens[j].content || tokens[j].markup;
          }
          if (content) {
            const textToken = new Token("text", "", 0);
            textToken.content = content;
            newTokens.push(textToken);
          }
          const endToken = tokens[endTokenIdx];
          endToken.type = "html_inline_close";
          newTokens.push(endToken);
          i = endTokenIdx;
        }
      }
    }

    // replace state.tokens with new tokens (can not use `state.tokens = newTokens`)
    state.tokens.splice(0, max, ...newTokens);
  });
}
