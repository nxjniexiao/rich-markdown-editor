import sanitizeHtml from "sanitize-html";

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
