import { createContext, type ReactNode } from 'react';

/**
 * What a spinner gives its glyph: its classes (the size, the turning, and standing still for a
 * person who asked for less motion) and its accessibility (an image named by `aria-label` when it
 * stands on its own, otherwise hidden as decoration). A glyph spreads them on the one `svg` it
 * draws.
 */
export type SpinnerGlyphProps = Readonly<{
  className: string;
  role: 'img' | undefined;
  'aria-label': string | undefined;
  'aria-hidden': true | undefined;
}>;

/**
 * Draws an app's own spinner: one `svg` that takes the props it is given on its root, with a square
 * view box centered on what turns, so it turns in place, and drawn in `currentColor` where it
 * follows the text it stands in. The drawing is still: the spinner turns it, and stops it for a
 * person who asked for less motion, which it could not do for a drawing that moves by itself. A
 * render function, called by each spinner with its props.
 */
export type RenderSpinnerGlyph = (props: SpinnerGlyphProps) => ReactNode;

/** The app's glyph, which every spinner draws; none, and a spinner draws Patina's ring. */
export const SpinnerGlyphContext = createContext<RenderSpinnerGlyph | null>(
  null,
);
