import type { ReactNode } from 'react';

import { type RenderSpinnerGlyph, SpinnerGlyphContext } from './context.js';

export type SpinnerProviderProps = {
  /** Draws the app's spinner (`RenderSpinnerGlyph`), such as `(props) => <BrandSpinner {...props} />`. */
  renderGlyph: RenderSpinnerGlyph;
  children: ReactNode;
};

/**
 * Gives every spinner under it the app's own glyph, once, at the app's root: a pending button's,
 * a pending field's or sidebar item's, `PendingStatus`'s and `Spinner`'s. The spinner keeps its
 * sizes, its turning, standing still for less motion, and its accessible name or hiding; the app
 * gives only the drawing, which is still (`RenderSpinnerGlyph`). Without it, a spinner draws Patina's ring.
 */
export const SpinnerProvider = ({
  renderGlyph,
  children,
}: SpinnerProviderProps) => (
  <SpinnerGlyphContext value={renderGlyph}>{children}</SpinnerGlyphContext>
);
