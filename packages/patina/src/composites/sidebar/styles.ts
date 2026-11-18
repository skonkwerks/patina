import { tv } from 'tailwind-variants';

/**
 * The sidebar: a column on the surface layer at the shell's left edge, `w-56` open and `w-14` as
 * the collapsed rail, with its header at the top, its groups in between (scrolling when long), and
 * its footer row at the foot. The footer is a row while open and a column on the rail.
 */
export const sidebarStyles = tv({
  slots: {
    root: 'bg-surface border-surface-border text-surface-foreground flex min-h-0 shrink-0 flex-col overflow-hidden border-e transition-[width] duration-200 motion-reduce:transition-none',
    tree: 'min-h-0 flex-1 overflow-y-auto',
    footer: 'border-surface-border flex shrink-0 items-center border-t py-2',
    footerContent: 'flex min-w-0 items-center',
    toggleIcon: 'size-4',
  },
  variants: {
    isCollapsed: {
      true: {
        root: 'w-14',
        footer: 'flex-col gap-1 px-1',
        footerContent: 'flex-col gap-1',
      },
      false: {
        root: 'w-56',
        footer: 'justify-between gap-2 px-3',
        footerContent: 'flex-1 gap-2',
      },
    },
  },
});

/** The sidebar's header: the brand while open, the compact mark centered on the rail. */
export const sidebarHeaderStyles = tv({
  base: 'flex h-16 shrink-0 items-center pt-2',
  variants: {
    isCollapsed: { true: 'justify-center', false: 'px-4' },
  },
});

/**
 * One item: its icon, then its name, count and status marks. On the rail the name and what follows
 * it are not drawn (the link keeps its name in words), the icon is centered, and an alert is a dot
 * on the icon's corner.
 */
export const sidebarItemStyles = tv({
  slots: {
    iconFrame: 'relative inline-flex shrink-0 [&>svg]:size-4.5',
    alertDot: 'absolute -top-1 -right-1 size-2 rounded-full',
    text: 'inline-flex min-w-0 items-center gap-1',
    count: 'text-surface-foreground-muted',
    spinner: 'text-surface-foreground-muted ms-1',
    alertIcon: 'ms-1 size-3.5 shrink-0',
  },
  variants: {
    isCollapsed: {
      true: { iconFrame: 'mx-auto', text: 'hidden' },
    },
    alertTone: {
      warning: { alertDot: 'bg-warning', alertIcon: 'text-warning' },
      error: { alertDot: 'bg-error', alertIcon: 'text-error' },
    },
  },
});
