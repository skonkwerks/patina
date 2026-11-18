import { tv } from 'tailwind-variants';

/**
 * A count stands on any layer: a page's heading, a list's section on a surface, a field's label.
 * It takes the color of where it stands, at normal weight, so it names no layer's token; a caller
 * on a known layer gives it that layer's muted token (`Header` on the canvas, a `GridList` section
 * on a surface). It is not faded by opacity: that would compound with a muted token and fall below
 * the text contrast minimum.
 */
export const countStyles = tv({
  base: 'font-normal',
});
