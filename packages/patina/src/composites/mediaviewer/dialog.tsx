import type { Key } from 'react-aria-components';

import { DialogModal } from '../../aria/dialog/index.js';
import type { CarouselItem } from '../carousel/index.js';
import type { MediaViewerContentProps } from './component.js';
import Content from './content.js';
import { mediaViewerDialogStyles } from './styles.js';

export type MediaViewerDialogProps<T extends CarouselItem> =
  MediaViewerContentProps<T> & {
    /** The set, in order. It may change while the dialog is open. */
    items: readonly T[];
    /**
     * The slide the viewer opens on, each time it opens; the first when it names none. A slide
     * the set does not hold yet, such as one in a page still being read, is awaited: the viewer
     * shows the first slide meanwhile, and goes to that one when it first arrives, unless the
     * person has turned the viewer before then.
     */
    defaultCurrentId?: Key;
    /** The dialog's title, which names the dialog and its viewer: what the set is. */
    title: string;
    /** The accessible name of the dialog's close control. */
    closeLabel: string;
    /** The accessible name of the full-screen toggle. */
    fullScreenLabel: string;
    /** Whether the dialog is open, for a dialog opened from state; inside a `DialogTrigger`, the trigger's. */
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    /** While true, nothing closes the dialog, as while a write started from one of its actions is pending. */
    isDismissDisabled?: boolean;
    /**
     * The dialog's size, which is the app's to choose: Patina's default box is the window's 90% in
     * height and up to 72rem wide, and classes here replace it, such as another width
     * (`max-w-4xl`) or height (`h-[70vh]`), or another details height
     * (`[--media-viewer-details-height:10rem]`). The dialog keeps the box it is given for every
     * picture. Full screen fills the window whatever it says.
     */
    className?: string;
  };

/**
 * A `MediaViewer` in a centered modal, opened on one slide of the set: the dialog's title, full
 * screen and the close control in its header, and the viewer under them. The dialog does not fit
 * its picture: it is one box, of the size the app gives it (`className`; Patina's default
 * otherwise), so nothing in it moves between pictures of different shapes or captions and details
 * of different lengths, and a picture of another shape than the frame sits whole inside it, with
 * bars. Fitting the box to each picture would move it, and Previous and Next with it, at every
 * turn; an app that wants its box closer to its pictures' shape sets that size. The arrow keys
 * turn it while the focus is anywhere in the dialog, except in a control that uses them (a video's
 * player, a slider, a text field). Full screen, a toggle, makes the dialog fill the window and
 * back; each opening starts at the dialog's own size, on the slide it opens on. Escape, the scrim,
 * and the close control close it, except while `isDismissDisabled`, and the focus returns to what
 * opened it. Nothing opens over it: an action that needs a dialog belongs to the page behind it.
 * Place it in a `DialogTrigger` with its opener, or open it from state with `isOpen` and
 * `onOpenChange`.
 */
export const MediaViewerDialog = <T extends CarouselItem>({
  isOpen,
  onOpenChange,
  isDismissDisabled,
  className,
  ...content
}: MediaViewerDialogProps<T>) => (
  <DialogModal
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    isDismissDisabled={isDismissDisabled}
    className={mediaViewerDialogStyles().modal({ className })}
  >
    <Content {...content} />
  </DialogModal>
);
