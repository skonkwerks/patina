import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';

/**
 * The sideways scrollbar under a table wider than its frame. It sticks to the bottom of the window,
 * or of the area the page scrolls in, while the table runs past it. Its track holds nothing but the
 * table's width. Where its scrollbar takes room (a classic scrollbar, or the styled one
 * `scrollbar-visible` draws in Chromium-based browsers and Safari), it is drawn on the surface,
 * over the rows it stands on while stuck. Where the scrollbar takes none (an overlay scrollbar, as
 * Firefox draws on macOS), it keeps 16px for one to appear in, as Cloudscape's keeps 15px, and is
 * clear. Either way it stands under the table, so it covers no row but while it is stuck over the
 * rows at the bottom of the window.
 */
export const tableScrollbarStyles = tv({
  slots: {
    root: 'scrollbar-visible sticky bottom-0 z-10 overflow-x-auto overflow-y-hidden',
    track: 'h-px',
  },
  variants: {
    isShown: { false: { root: 'hidden' } },
    hasOverlayScrollbar: {
      false: { root: 'bg-surface' },
      true: { root: 'h-4' },
    },
  },
});

/** Moves `to` sideways to where `from` is, unless it is there already. */
const follow = (from: HTMLElement, to: HTMLElement) => {
  // Within a pixel: a fractional position read back rounded would otherwise move the two in turn.
  if (Math.abs(to.scrollLeft - from.scrollLeft) >= 1) {
    to.scrollLeft = from.scrollLeft;
  }
};

type TableScrollbarProps = Readonly<{
  /** The element that scrolls the table sideways, whose own scrollbar is hidden. */
  scroller: HTMLElement | null;
  /** The table, which widens as rows with longer text are read or a column is resized. */
  table: HTMLElement | null;
}>;

/**
 * The table's sideways scrollbar, as Cloudscape's: shown only while the table is wider than its
 * frame, and scrolled with the table both ways, so the person scrolls the table sideways from the
 * bottom of the window without scrolling down to its last row. It is hidden from assistive
 * technology and out of the Tab order, since the keyboard and assistive technology reach every
 * cell through the table itself.
 */
export const TableScrollbar = ({ scroller, table }: TableScrollbarProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  // The table's scroll width while it is wider than its frame; null while it fits.
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const [hasOverlayScrollbar, setHasOverlayScrollbar] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    if (scroller === null || table === null || bar === null) {
      return;
    }
    // The bar and the scroller are equally wide, so a track as wide as the table gives the bar the
    // scroller's range, and either can follow the other to any position.
    const measure = () => {
      setContentWidth(
        scroller.scrollWidth > scroller.clientWidth
          ? scroller.scrollWidth
          : null,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(table);
    const fromScroller = () => {
      follow(scroller, bar);
    };
    const fromBar = () => {
      follow(bar, scroller);
    };
    scroller.addEventListener('scroll', fromScroller, { passive: true });
    bar.addEventListener('scroll', fromBar, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', fromScroller);
      bar.removeEventListener('scroll', fromBar);
    };
  }, [scroller, table]);

  // A bar just shown starts where the table is scrolled to, and learns whether its scrollbar takes
  // room, which only a shown bar with something to scroll can tell.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (contentWidth === null || scroller === null || bar === null) {
      return;
    }
    follow(scroller, bar);
    if (!hasOverlayScrollbar) {
      setHasOverlayScrollbar(bar.offsetHeight === bar.clientHeight);
    }
  }, [contentWidth, scroller, hasOverlayScrollbar]);

  const styles = tableScrollbarStyles({
    isShown: contentWidth !== null,
    hasOverlayScrollbar,
  });
  return (
    <div ref={barRef} aria-hidden tabIndex={-1} className={styles.root()}>
      <div className={styles.track()} style={{ width: contentWidth ?? 0 }} />
    </div>
  );
};
