import { useEffect, useRef } from 'react';

import { focusPageHeading } from '../../header/index.js';
import { Confirmation, type ConfirmationProps } from './confirmation.js';

/** How a confirmed write closes its confirmation. */
export type AlertDialogCloseOptions = {
  /**
   * The write removed the control that opened the confirmation (a row deleted through its own
   * Delete), so the focus goes to the page's heading once the dialog has gone, not back to it.
   */
  isOpenerRemoved?: boolean;
};

type ContentProps = Omit<ConfirmationProps, 'onAction'> & {
  /** `AlertDialogProps.onAction`. */
  onAction: (close: (options?: AlertDialogCloseOptions) => void) => void;
  /** Closes the dialog: React Aria's `close`. */
  close: () => void;
};

/**
 * A sidecar of `AlertDialog`, private to the family: the confirmation inside the dialog, which
 * mounts with each opening and leaves with the modal. It owes the focus once the write has removed
 * the control that opened the dialog, and gives it to the page's heading as it leaves.
 *
 * While the modal is open, React Aria keeps the page inert, so the heading can take the focus only
 * once the modal has gone. This relies on how React and React Aria order the modal's leaving, not
 * on a documented API (react-aria 3.53.1, react-dom 19.2.8):
 *
 * - React Aria makes the page inert in `useModalOverlay`'s passive effect (`ariaHideOutside` with
 *   `shouldUseInert`), which runs in `ModalOverlay`, an ancestor of this content. React runs the
 *   passive cleanups of a removed tree parent before child, so the page is no longer inert when
 *   this cleanup runs, whether the dialog was closed or left with the row that held it.
 * - `FocusScope` gives the focus back to the opener in the next frame, and only if it finds the
 *   focus on the body then, so it leaves the heading alone.
 *
 * Check both on every React Aria or React upgrade: the `RemovesItsOpener` and
 * `ClosesBeforeTheRowLeaves` stories confirm a removal and expect the heading to hold the focus.
 */
const C = ({ onAction, close, ...confirmation }: ContentProps) => {
  // What the write did, recorded by its `close` and read once as the dialog leaves; nothing
  // renders from it, and a new opening mounts a new record.
  const isOpenerRemoved = useRef(false);
  useEffect(
    () => () => {
      if (isOpenerRemoved.current) {
        focusPageHeading();
      }
    },
    [],
  );
  return (
    <Confirmation
      {...confirmation}
      onAction={() =>
        onAction((options) => {
          isOpenerRemoved.current = options?.isOpenerRemoved ?? false;
          close();
        })
      }
    />
  );
};

C.displayName = 'AlertDialogContent';
export default C;
