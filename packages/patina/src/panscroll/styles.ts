import { tv } from 'tailwind-variants';

/**
 * The wrapper `PanScroll` draws around its children: it takes no room of its own, and its text
 * cannot be selected by a mouse drag, which is a pan there.
 */
export const panScrollStyles = tv({ base: 'min-w-0 select-none' });

/**
 * What a scroller `PanScroll` drives applies to its items, the one place `PAN_MOVING` and
 * `PAN_OVERSCROLL` (`pan.ts`) are written as Tailwind classes: while it pans, its items ignore the
 * pointer and are kept ready to move; while they rebound past an end, they shift by
 * `--pan-overscroll`. A scroller adds these classes to its own, as `MediaStrip`'s row does.
 */
export const panScrollTargetStyles = tv({
  base: 'data-[panning]:*:pointer-events-none data-[panning]:*:will-change-[translate] [&>*]:[translate:var(--pan-overscroll)]',
});
