import {
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components';

import { OverlayContextBoundary } from '../../internal/overlaycontextboundary.js';
import { dialogStyles } from './component.js';
import { DialogPlacementContext, DismissDisabledContext } from './context.js';

export type DialogModalProps = Omit<
  ModalOverlayProps,
  'isKeyboardDismissDisabled' | 'isDismissable' | 'className'
> & {
  /** The dialog's width class, when the default (`max-w-md`) does not fit what it shows. */
  className?: string;
  /**
   * Where the modal stands; the call site chooses. `center` (the default): as large as its content
   * needs, up to 90% of the window's height, scrolling past that. `right`: the modal drawer, the
   * window's full height at the right edge, with the same set width (which `className` may change
   * for what it shows) and its title and close control fixed over a body that scrolls. When the
   * modal drawer fits is the guidelines' `ux/editing-surfaces.md#the-modal-drawer`; both
   * placements keep every rule of `ux/dialogs.md`.
   */
  placement?: 'center' | 'right';
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
 * The modal frame around a `Dialog`: a scrim and a surface, centered or at the right edge
 * (`placement`), closed by Escape, a press on the scrim, the close control, or `DialogCancel`; one
 * that is not `isDismissable` only by the last two, and none while `isDismissDisabled`. Everything
 * under it is inert, an open side panel included, and the focus returns to its opener when it
 * closes. A modal never opens another modal over itself: a confirmation a dialog needs is a step
 * inside it.
 */
export const DialogModal = ({
  className,
  placement = 'center',
  children,
  isDismissDisabled = false,
  isDismissable = true,
  ...rest
}: DialogModalProps) => {
  const styles = dialogStyles({ placement });
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
          <DialogPlacementContext value={placement}>
            <DismissDisabledContext value={isDismissDisabled}>
              {/* What the modal was opened from does not reach into it: a `Separator` or a
                `ToggleGroup` in a modal opened from a `Toolbar` takes its own orientation. */}
              <OverlayContextBoundary>
                {typeof children === 'function'
                  ? children(renderProps)
                  : children}
              </OverlayContextBoundary>
            </DismissDisabledContext>
          </DialogPlacementContext>
        )}
      </Modal>
    </ModalOverlay>
  );
};
