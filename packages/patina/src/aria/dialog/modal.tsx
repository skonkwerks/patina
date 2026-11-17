import {
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components';

import { dialogStyles } from './component.tsx';
import { DismissDisabledContext } from './context.ts';

export type DialogModalProps = Omit<
  ModalOverlayProps,
  'isKeyboardDismissDisabled' | 'isDismissable' | 'className'
> & {
  /** The dialog's size: its width class, when the default does not fit. */
  className?: string;
  /**
   * While true, nothing dismisses the dialog: not Escape, not the scrim, not the close control, not `DialogCancel`.
   * Set it while a write started from the dialog is pending, so its outcome always lands in the dialog.
   */
  isDismissDisabled?: boolean;
  /**
   * Whether Escape and a press on the scrim close the dialog (the default). Set it to `false` for a
   * dialog that holds work the person would lose by closing it: then only its close control,
   * `DialogCancel`, or its own submit closes it, never an accidental Escape or click outside.
   */
  isDismissable?: boolean;
};

/**
 * The modal frame around a `Dialog`: a scrim and a centered surface, closed by Escape, a press on the
 * scrim, the close control, or `DialogCancel`; one that is not `isDismissable` only by the last two.
 */
export const DialogModal = ({
  className,
  children,
  isDismissDisabled = false,
  isDismissable = true,
  ...rest
}: DialogModalProps) => {
  const styles = dialogStyles();
  return (
    <ModalOverlay
      {...rest}
      isKeyboardDismissDisabled={isDismissDisabled || !isDismissable}
      isDismissable={!isDismissDisabled && isDismissable}
      className={styles.overlay()}
    >
      {/* The children (a Dialog) go inside the Modal, not the overlay; the overlay is the scrim. */}
      <Modal className={styles.modal({ className })}>
        {(renderProps) => (
          <DismissDisabledContext value={isDismissDisabled}>
            {typeof children === 'function' ? children(renderProps) : children}
          </DismissDisabledContext>
        )}
      </Modal>
    </ModalOverlay>
  );
};
