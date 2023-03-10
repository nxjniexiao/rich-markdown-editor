import MarkdownIt from "markdown-it";
import { Delimiter } from "markdown-it/lib/rules_inline/state_inline";

export default function markdownItNestedEmphasis(md: MarkdownIt): void {
  // balance_pairs 中会根据 open/close 属性去对 delimiters 进行配对，
  // 其中 open/close 与 https://spec.commonmark.org/0.30/#delimiter-run 有关。
  // 在 "balance_pairs" 前修正 delimiters ，从而支持解析嵌套的 Emphasis ，如：
  // 删除线内嵌加粗：~~**test**~~
  // 加粗内嵌删除线：**~~text~~**
  md.inline.ruler2.before("balance_pairs", "nested_emphasis", state => {
    const delimiters = state.delimiters;
    for (let i = 0; i < delimiters.length; ) {
      const delim = delimiters[i];
      const marker = delim.marker;
      if (
        marker === 0x5f /* _ */ || // emphasis
        marker === 0x2a /* * */ || // emphasis
        marker === 0x7e /* ~ */ // strikethrough
      ) {
        const len = Math.max(1, delim.length);
        // TEXT~~**TEXT**~~TEXT
        //     ^open:false 应修改为 true
        if (!delim.open && hasAdjacent(delimiters, i, false)) {
          for (let j = i; j < i + len; j++) {
            delimiters[j].open = true;
          }
        }
        // TEXT~~**TEXT**~~TEXT
        //               ^close:false 应修改为 true
        if (!delim.close && hasAdjacent(delimiters, i, true)) {
          for (let j = i; j < i + len; j++) {
            delimiters[j].close = true;
          }
        }
        i += len;
      } else {
        i++;
      }
    }
  });
}

// forward 为 true 时，向前查找，反之向后查找。
// 指定位置 i 的 delim 有相邻 delim ，其 token 和指定位置的 token 也相邻，
// 并且 delimiters 中存在和相邻 delim 有成对的 delim 时，返回 true 。
function hasAdjacent(delimiters: Delimiter[], i: number, forward: boolean) {
  const curr = delimiters[i];
  const len = Math.max(1, curr.length);
  const siblingIdx = forward ? i - 1 : i + len;
  const sibling = delimiters[siblingIdx];
  if (!sibling) return false;
  const tokenDiff = Math.abs(sibling.token - curr.token);
  const isTokenAdjacent = forward ? tokenDiff === 1 : tokenDiff === len;
  if (!isTokenAdjacent) return false;
  let idx = siblingIdx;
  const hasNext = () => {
    const length = Math.max(1, delimiters[idx].length);
    forward ? (idx -= length) : (idx += length);
    return idx > -1 && idx < delimiters.length;
  };
  // 查找是否有与 sibling 成对的 delim
  while (hasNext()) {
    if (
      delimiters[idx].marker === sibling.marker &&
      delimiters[idx].length >= sibling.length // emphasis
    ) {
      return true;
    }
  }
  return false;
}
