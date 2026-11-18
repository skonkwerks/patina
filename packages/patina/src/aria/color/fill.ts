import type { CSSProperties } from 'react';

/**
 * The checkerboard drawn behind a color that may be translucent, so a transparent part reads as
 * transparent rather than as the layer behind it.
 *
 * Its two grays are fixed, not tokens: like the color the person chose, which it stands behind, it
 * is content the controls show, the same in both themes, so a translucent color looks the same
 * wherever it is shown.
 */
// Exception to the theme-token rule (#9): the transparency checkerboard is the universal sign of
// transparency; theme colors would stop reading as it.
const TRANSPARENCY_GRID =
  'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 16px 16px';

/** A CSS `background` that draws `color` over the transparency grid. */
export const colorOverGrid = (color: string): string =>
  `linear-gradient(${color}, ${color}), ${TRANSPARENCY_GRID}`;

/**
 * A CSS `background` that draws React Aria's own gradient (a color slider's or a color wheel's
 * track, from its default style) over the transparency grid, which shows only where the gradient is
 * translucent, as on an alpha slider.
 */
export const gradientOverGrid = (
  gradient: CSSProperties['background'],
): string =>
  typeof gradient === 'string'
    ? `${gradient}, ${TRANSPARENCY_GRID}`
    : TRANSPARENCY_GRID;
