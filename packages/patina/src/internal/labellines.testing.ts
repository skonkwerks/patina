/*
 * For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).
 */

/** One line of a label's text, as drawn: its extent, and the middle of the line it stands on. */
export type LabelLine = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  middle: number;
};

/**
 * The lines a label's text is drawn on, from the top, measured from the boxes of its text (a
 * `Range` over the label's contents), so a label that wraps gives one line each whether it is an
 * inline element or a block. A line's `right` is where its last word ends, and its `middle` is the
 * middle of the line it stands on: the text's box is centered on its line.
 */
export const labelLines = (label: Element): LabelLine[] => {
  const range = label.ownerDocument.createRange();
  range.selectNodeContents(label);
  const lines: LabelLine[] = [];
  for (const box of range.getClientRects()) {
    if (box.width === 0) {
      continue;
    }
    const middle = (box.top + box.bottom) / 2;
    const line = lines.find(
      (each) => Math.abs(each.middle - middle) < box.height / 2,
    );
    if (line === undefined) {
      lines.push({
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        middle,
      });
    } else {
      line.top = Math.min(line.top, box.top);
      line.bottom = Math.max(line.bottom, box.bottom);
      line.left = Math.min(line.left, box.left);
      line.right = Math.max(line.right, box.right);
    }
  }
  lines.sort((first, second) => first.top - second.top);
  return lines;
};
