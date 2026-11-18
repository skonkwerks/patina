// For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).

import { ringOf } from '../calendar/month.testing.js';

/**
 * The room, in pixels, between the focus ring an element inside a box draws and the inside of the
 * box's border, above, below and at the end (left to right): a positive number on each side means
 * the ring stands clear of the border.
 */
export const ringClearance = (inner: Element, box: Element) => {
  const { width, offset } = ringOf(inner);
  const reach = width + offset;
  const border = Number.parseFloat(getComputedStyle(box).borderTopWidth);
  const outer = box.getBoundingClientRect();
  const edge = inner.getBoundingClientRect();
  return {
    top: edge.top - reach - (outer.top + border),
    bottom: outer.bottom - border - (edge.bottom + reach),
    end: outer.right - border - (edge.right + reach),
  };
};
