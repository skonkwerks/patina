import { IconX } from '@tabler/icons-react';
import { createContext, type ReactNode, use } from 'react';
import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Button, type ButtonProps } from './button.tsx';
import { IconButton } from './iconbutton.tsx';

export const dialogStyles = tv({
  slots: {
    overlay: 'bg-scrim fixed inset-0 z-50 flex items-center justify-center p-4',
    modal:
      'bg-overlay border-overlay-border text-overlay-foreground max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border shadow-xl outline-0',
    dialog: 'flex flex-col gap-4 p-5 outline-0',
    header: 'flex items-start justify-between gap-3',
    heading: 'min-w-0',
    titleRow: 'flex items-center gap-2',
    title: 'text-overlay-foreground text-lg font-semibold',
    description: 'text-overlay-foreground-muted text-sm',
    headerActions: '-mt-1 -mr-1 flex shrink-0 items-center gap-1',
    closeIcon: 'h-4 w-4',
  },
});

/** Connects a modal to its opener so React Aria owns focus restoration and trigger semantics. */
export { DialogTrigger } from 'react-aria-components';

export type DialogProps = Omit<AriaDialogProps, 'className'> & {
  /** The dialog's title, rendered as its accessible name. */
  title: string;
  /** One short line under the title, as a page header has: when it started, what it belongs to. */
  description?: string;
  /** Accessible name of the icon-only close control, such as the vocabulary's word for Close. */
  closeLabel: string;
  /** What sits in the header between the title and the close control, such as a viewer's place in its set. */
  headerContent?: ReactNode;
  /** Controls beside the close control, before it, such as a viewer's Full screen. */
  headerActions?: ReactNode;
  className?: string;
};

/** A dialog's content: title plus children, on an overlay surface. Use inside `DialogModal`. */
export const Dialog = ({
  title,
  description,
  closeLabel,
  headerContent,
  headerActions,
  className,
  children,
  ...rest
}: DialogProps) => {
  const isDismissDisabled = use(DismissDisabledContext);
  const styles = dialogStyles();
  return (
    <AriaDialog {...rest} className={styles.dialog({ className })}>
      {(renderProps) => (
        <>
          <div className={styles.header()}>
            <div className={styles.heading()}>
              <div className={styles.titleRow()}>
                <Heading slot='title' className={styles.title()}>
                  {title}
                </Heading>
              </div>
              {description && (
                <p className={styles.description()}>{description}</p>
              )}
            </div>
            {headerContent}
            <div className={styles.headerActions()}>
              {headerActions}
              <IconButton
                size='sm'
                radius='full'
                aria-label={closeLabel}
                onPress={renderProps.close}
                isDisabled={isDismissDisabled}
              >
                <IconX aria-hidden className={styles.closeIcon()} />
              </IconButton>
            </div>
          </div>
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </AriaDialog>
  );
};

/** Whether the open dialog may be dismissed; `DialogModal` provides it, the close control and `DialogCancel` read it. */
const DismissDisabledContext = createContext(false);

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

/**
 * The dialog's Cancel button: it closes the dialog, and it is disabled whenever the dialog may not be
 * dismissed, under the same rule as Escape and the close control.
 */
export type DialogCancelProps = Omit<ButtonProps, 'slot'>;

export const DialogCancel = (props: DialogCancelProps) => {
  const isDismissDisabled = use(DismissDisabledContext);
  return (
    <Button
      {...props}
      slot='close'
      isDisabled={isDismissDisabled || props.isDisabled}
    />
  );
};
