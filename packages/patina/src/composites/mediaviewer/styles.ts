import { tv } from 'tailwind-variants';

import { focusVisibleRing } from '../../internal/focus.ts';

/**
 * A media viewer's parts, in a column of a given height (32rem unless the caller sizes it), which
 * never follows the picture shown: the carousel takes what the area under it leaves. Under it,
 * the caption line is one line of one height for every slide (the caption cut at its end, the
 * actions after it), and the details area is one height for every slide,
 * `--media-viewer-details-height` (6rem unless the caller sets it, for the common length of its
 * text), scrolling inside past that, so the frame keeps its size as the slides turn; it takes the
 * focus, with the shared focus ring (`focusVisibleRing`), so the keyboard can scroll it. Its text
 * takes the color of where it stands.
 */
export const mediaViewerStyles = tv({
  slots: {
    root: 'flex h-[32rem] min-h-0 min-w-0 flex-col gap-3',
    carousel: 'h-auto min-h-0 flex-1',
    captionLine: 'flex h-8 shrink-0 items-center gap-3',
    caption: 'min-w-0 flex-1 truncate text-sm',
    actions: 'flex shrink-0 items-center gap-2',
    details: [
      focusVisibleRing(),
      'h-[var(--media-viewer-details-height,6rem)] shrink-0 overflow-y-auto rounded-sm text-sm',
    ],
  },
});

/**
 * A `MediaViewerDialog`'s parts. Its modal, through `DialogModal`'s `className`: one box, which
 * does not fit its picture, so nothing in it moves from one picture to the next. Patina's default
 * is a set height, the window's 90%, as wide as the window allows up to 72rem, laid out as a column
 * the dialog and then the viewer fill; the app's size replaces it, given as classes after these
 * (another width or height, or another details height). While the
 * dialog inside it is in full screen (`data-full-screen`, which the dialog holds), the modal fills
 * the window: those classes match through `:has()`, which outweighs a caller's plain classes.
 */
export const mediaViewerDialogStyles = tv({
  slots: {
    modal: [
      'flex h-[90vh] max-w-6xl flex-col overflow-hidden',
      'has-[[data-full-screen]]:fixed has-[[data-full-screen]]:inset-0 has-[[data-full-screen]]:h-auto has-[[data-full-screen]]:max-h-none has-[[data-full-screen]]:w-auto has-[[data-full-screen]]:max-w-none has-[[data-full-screen]]:rounded-none has-[[data-full-screen]]:border-0',
    ],
    dialog: 'min-h-0 flex-1',
    viewer: 'h-auto flex-1',
    fullScreenIcon: 'h-4 w-4',
  },
});
