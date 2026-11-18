import { tv } from 'tailwind-variants';

/**
 * The page column: one gutter and one vertical rhythm for the trail, the header, the notice and
 * the content. A workbench fills the content width; with `fill` it takes the window's height and
 * its last child scrolls inside it. A welcome page centers a narrow column.
 */
export const pageStyles = tv({
  slots: {
    root: 'py-6',
    frame: 'px-9',
    column: 'flex min-w-0 flex-col gap-5',
    welcomeBody: 'flex flex-1 items-center justify-center px-6 py-10',
    welcomeColumn: 'flex w-full max-w-xl flex-col gap-10',
  },
  variants: {
    layout: {
      workbench: {},
      welcome: { root: 'flex min-h-full flex-col' },
    },
    isFilling: {
      true: {
        root: 'flex h-full flex-col',
        frame: 'flex min-h-0 flex-1 flex-col',
        column: 'min-h-0 flex-1',
      },
    },
  },
  defaultVariants: { layout: 'workbench', isFilling: false },
});
