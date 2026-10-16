import { type ReactNode } from "react";

/** Deliberately not HTML/Markdown: only these three inline delimiters are interpreted.
 * Everything else remains React-escaped text, including links, images and raw HTML.
 * The encoded string uses the existing comment contract (500 characters including markers).
 */
export type ReviewFormat = "bold" | "italic" | "underline";
const markers = { bold: "**", italic: "*", underline: "__" } as const;
export function formatSelection(text: string, start: number, end: number, format: ReviewFormat) {
  if (start === end) return text;
  const marker = markers[format];
  if (text.slice(start - marker.length, start) === marker && text.slice(end, end + marker.length) === marker) {
    return text.slice(0, start - marker.length) + text.slice(start, end) + text.slice(end + marker.length);
  }
  return text.slice(0, start) + marker + text.slice(start, end) + marker + text.slice(end);
}

function renderInline(text: string): ReactNode {
  type Frame = { marker: string; nodes: ReactNode[] };
  const stack: Frame[] = [{marker: "", nodes: []}];
  let index = 0;
  while (index < text.length) {
    const frame = stack[stack.length - 1];
    // A single italic delimiter must not consume an opening bold delimiter.
    const closes = frame.marker && text.startsWith(frame.marker, index) &&
      (frame.marker !== "*" || !text.startsWith("**", index) || text.startsWith("***", index));
    if (closes) {
      stack.pop();
      const key = index;
      const content = frame.nodes;
      stack[stack.length - 1].nodes.push(frame.marker === "**" ? <strong key={key}>{content}</strong> : frame.marker === "__" ? <u key={key}>{content}</u> : <em key={key}>{content}</em>);
      index += frame.marker.length;
      continue;
    }
    const marker = ["**", "__", "*"].find(value => text.startsWith(value, index));
    if (marker && stack.length < 9) {
      stack.push({marker, nodes: []});
      index += marker.length;
    } else {
      frame.nodes.push(text[index]);
      index++;
    }
  }
  // Incomplete delimiters remain literal; never discard user content.
  while (stack.length > 1) {
    const frame = stack.pop()!;
    stack[stack.length - 1].nodes.push(frame.marker, ...frame.nodes);
  }
  return stack[0].nodes;
}
export default function ReviewText({text}: {text: string}) {
  return <span className="whitespace-pre-wrap wrap-break-word">{renderInline(text)}</span>;
}
