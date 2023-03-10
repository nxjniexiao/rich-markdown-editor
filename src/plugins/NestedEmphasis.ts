import Extension from "../lib/Extension";
import markdownItNestedEmphasis from "../rules/nestedEmphasis";

export default class NestedEmphasis extends Extension {
  get name() {
    return "nested_emphasis";
  }

  // markdown-it 解析 markdown 时使用
  get rulePlugins() {
    return [markdownItNestedEmphasis];
  }
}
