import sanitizeHtml from "sanitize-html";
import { validInlineHtmlPairs } from "../../rules/inlineHtmlPairs";

const defaultOptionsForBlockHtml = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    iframe: ["src"],
    "*": ["style"],
  },
  parseStyleAttributes: false,
};

export function sanitizeBlockHtml(html: string) {
  const safeHtml = sanitizeHtml(html, defaultOptionsForBlockHtml);

  return safeHtml;
}

const defaultOptionsForInlineHtml = {
  allowedTags: validInlineHtmlPairs,
  allowedAttributes: {
    a: ["href", "name", "target"],
    "*": ["style"],
  },
  parseStyleAttributes: false,
};

export function sanitizeInlineHtml(html: string) {
  const safeHtml = sanitizeHtml(html, defaultOptionsForInlineHtml);

  return safeHtml;
}
