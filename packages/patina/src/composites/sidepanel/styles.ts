import { tv } from 'tailwind-variants';

/**
 * The side panel: a column at the right edge, as wide as `--side-panel-width` (24rem unless the
 * app sets it), that has no width while closed and pushes the page aside when open. It sits on the
 * overlay layer, owns its scrolling, and keeps its title and close control at the top.
 */
export const sidePanelStyles = tv({
  slots: {
    root: 'bg-overlay border-overlay-border text-overlay-foreground shrink-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none',
    frame: 'flex h-full w-[var(--side-panel-width,24rem)] flex-col',
    header:
      'border-overlay-border flex min-h-14 shrink-0 items-center justify-between gap-3 border-b px-5 py-2',
    // A long title wraps rather than being cut: it names what the panel is about.
    title: 'min-w-0 text-lg font-semibold break-words',
    closeIcon: 'size-4',
    body: 'min-h-0 flex-1 overflow-y-auto p-5',
  },
  variants: {
    isOpen: {
      true: { root: 'w-[var(--side-panel-width,24rem)] border-s' },
      false: { root: 'w-0' },
    },
  },
});
