import {
  Dialog,
  DialogModal,
  type DialogModalProps,
} from '../../aria/dialog/index.js';
import type { ConfirmationProps } from './confirmation.js';
import Content, { type AlertDialogCloseOptions } from './content.js';

export type { AlertDialogCloseOptions };

export type AlertDialogProps = Omit<ConfirmationProps, 'onAction'> &
  Pick<DialogModalProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'> & {
    /** The dialog's title and accessible name: for a confirmation, the name of the thing alone. */
    title: string;
    /** Accessible name of the icon-only close control in the title row, such as "Close". */
    closeLabel: string;
    /**
     * The confirmed write is running: the action shows the pending spinner and ignores presses,
     * and nothing dismisses the dialog (not Escape, the scrim, the close control or Cancel).
     */
    isPending?: boolean;
    /**
     * Confirms: starts the write, and is given `close`, which the caller calls once the write has
     * succeeded (an action with no write calls it at once), with `isOpenerRemoved` when that success
     * removed the control that opened the dialog. On a failure the dialog stays open with
     * `errorMessage`, so the outcome lands where the person confirmed.
     */
    onAction: (close: (options?: AlertDialogCloseOptions) => void) => void;
  };

/**
 * A confirmation in a modal of its own: React Aria's alert dialog, named by its title and described
 * by its question, with the write's failure and Cancel and the action. While `isPending`, nothing
 * dismisses it (not Escape, the scrim, the close control or Cancel), so the write's outcome always
 * lands in it. Put it in a `DialogTrigger` beside the control that opens it, or open it from state
 * with `isOpen` and `onOpenChange`; the focus returns to the opener when it closes.
 *
 * A write that removes its opener closes the dialog with `{ isOpenerRemoved: true }`, and the
 * dialog gives the focus to the page's heading once it has gone (`focusPageHeading`), so the
 * focus never falls to the document and no application writes that step itself.
 */
export const AlertDialog = ({
  title,
  closeLabel,
  onAction,
  isOpen,
  defaultOpen,
  onOpenChange,
  isPending = false,
  ...confirmation
}: AlertDialogProps) => (
  <DialogModal
    isOpen={isOpen}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    isDismissDisabled={isPending}
  >
    <Dialog role='alertdialog' title={title} closeLabel={closeLabel}>
      {({ close }) => (
        <Content {...confirmation} onAction={onAction} close={close} />
      )}
    </Dialog>
  </DialogModal>
);
