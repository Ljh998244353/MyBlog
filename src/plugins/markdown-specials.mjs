import { h } from "hastscript";
import { visit } from "unist-util-visit";

const ADMONITION_LABELS = {
  note: "NOTE",
  tip: "TIP",
  important: "IMPORTANT",
  warning: "WARNING",
  caution: "CAUTION",
};

export function remarkCombined() {
  function processText(text) {
    if (!text) return [];

    const regex = /\{(.+?)\}\((.+?)\)|!!(.+?)!!|==(.+?)==/g;
    const nodes = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
      }

      if (match[1] && match[2]) {
        nodes.push({ type: "html", value: renderRuby(match[1], match[2]) });
      } else if (match[3]) {
        nodes.push({ type: "html", value: '<span class="spoiler">' });
        nodes.push(...processText(match[3]));
        nodes.push({ type: "html", value: "</span>" });
      } else if (match[4]) {
        nodes.push({ type: "html", value: '<span class="rainbow-text">' });
        nodes.push(...processText(match[4]));
        nodes.push({ type: "html", value: "</span>" });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push({ type: "text", value: text.slice(lastIndex) });
    }

    return nodes.length > 0 ? nodes : [{ type: "text", value: text }];
  }

  return tree => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number" || !node.value) return;

      const resultNodes = processText(node.value);
      const changed =
        resultNodes.length > 1 ||
        (resultNodes.length === 1 && resultNodes[0].type !== "text");

      if (!changed) return;

      parent.children.splice(index, 1, ...resultNodes);
      return index + resultNodes.length;
    });
  };
}

export function parseDirectiveNode() {
  return tree => {
    visit(tree, node => {
      if (
        node.type !== "containerDirective" &&
        node.type !== "leafDirective" &&
        node.type !== "textDirective"
      ) {
        return;
      }

      const data = node.data || (node.data = {});
      node.attributes = node.attributes || {};

      if (node.children?.[0]?.data?.directiveLabel) {
        node.attributes["has-directive-label"] = true;
      }

      const hast = h(node.name, node.attributes);

      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}

export function AdmonitionComponent(properties, children, type) {
  if (!Array.isArray(children) || children.length === 0) {
    return h("div", { class: "hidden" }, "Invalid admonition content");
  }

  let label = ADMONITION_LABELS[type] ?? type.toUpperCase();

  if (properties?.["has-directive-label"]) {
    const [labelNode, ...content] = children;
    children = content;
    labelNode.tagName = "span";
    label = labelNode;
  }

  return h("div", { class: type }, [
    h("span", { class: "admonition-title" }, label),
    ...children,
  ]);
}

export function QuoteComponent(properties, children) {
  if (!Array.isArray(children) || children.length === 0) {
    return h("div", { class: "hidden" }, "Invalid quote content");
  }

  const content = properties?.["has-directive-label"]
    ? children.slice(1)
    : children;

  return h("div", { class: "quote" }, flattenQuoteParagraphs(content));
}

function renderRuby(baseText, readingText) {
  if (!readingText.includes("|")) {
    return `<ruby>${escapeHtml(baseText)}<rt>${escapeHtml(readingText)}</rt></ruby>`;
  }

  const baseChars = Array.from(baseText);
  const readings = readingText.split("|");
  const length = Math.max(baseChars.length, readings.length);
  let rubyInnerHtml = "";

  for (let index = 0; index < length; index += 1) {
    rubyInnerHtml += `${escapeHtml(baseChars[index] ?? "")}<rt>${escapeHtml(
      readings[index] ?? ""
    )}</rt>`;
  }

  return `<ruby>${rubyInnerHtml}</ruby>`;
}

function flattenQuoteParagraphs(nodes) {
  return nodes.flatMap((node, index) => {
    if (node.type !== "element") return node;

    if (node.tagName === "p") {
      const children = flattenQuoteParagraphs(node.children || []);
      return index < nodes.length - 1 ? [...children, h("br")] : children;
    }

    return {
      ...node,
      children: flattenQuoteParagraphs(node.children || []),
    };
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
