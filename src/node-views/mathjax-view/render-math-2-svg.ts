import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { browserAdaptor } from "mathjax-full/js/adaptors/browserAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import juice from "juice/client";

const documentOptions = {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: "none" }),
};
const convertOptions = {
  display: false,
};

export function renderMath2SVG(math: string, inline: boolean): string {
  const content = math?.trim() || "...";
  try {
    const adaptor = browserAdaptor();
    const handler = RegisterHTMLHandler(adaptor);
    AssistiveMmlHandler(handler);
    const mathDocument = mathjax.document(window.document, documentOptions);
    convertOptions.display = !inline;
    const svg = mathDocument.convert(content, convertOptions);
    const html = adaptor.outerHTML(svg);
    const stylesheet = adaptor.outerHTML(
      documentOptions.OutputJax.styleSheet(mathDocument) as any
    );
    const text = juice(html + stylesheet);
    return text;
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    return error as string;
  }
}
