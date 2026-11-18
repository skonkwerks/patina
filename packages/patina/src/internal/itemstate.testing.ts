/*
 * For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).
 */

/**
 * The start edge a row draws its selected bar on (`rowStateStyles`), as the browser computes it: a
 * selected row's is 2px of the primary color, an unselected row's 2px and transparent. A story holds
 * the selected color to 3:1 against the surface with `contrastRatio`.
 */
export const startEdgeOf = (row: Element) => {
  const style = getComputedStyle(row);
  return {
    width: style.borderInlineStartWidth,
    color: style.borderInlineStartColor,
  };
};

/** The color a transparent edge computes to. */
export const TRANSPARENT = 'rgba(0, 0, 0, 0)';
