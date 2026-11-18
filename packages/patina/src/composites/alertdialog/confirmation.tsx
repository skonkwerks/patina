import type { ReactNode } from 'react';
import { Text } from 'react-aria-components';

import { Button } from '../../aria/button/index.js';
import { DialogCancel, useIsDismissDisabled } from '../../aria/dialog/index.js';
import { confirmationStyles } from './styles.js';

export type ConfirmationProps = {
  /** The one question, such as "Are you sure you want to delete this project?". */
  children: ReactNode;
  /** The text of the button that dismisses the question: "Cancel", or "No" when the question is whether to cancel something. */
  cancelLabel: string;
  /** The text of the button that confirms, such as "Yes", or the action's own verb for an action with a consequence. */
  actionLabel: string;
  /**
   * What confirming does. `destructive`: it takes something away or ends it; the action is drawn
   * destructive and the focus starts on Cancel, so Enter pressed at once dismisses rather than
   * destroys. `primary`: it takes nothing away but has a consequence the question states; the
   * action is drawn primary and the focus starts on it.
   */
  tone: 'destructive' | 'primary';
  /** Confirms: starts the write. */
  onAction: () => void;
  /**
   * The outcome of the last confirmed write, directly above the action row, as `Form`'s
   * `errorText`: a node, so the app passes its own notice, such as an error `Alert` saying why the
   * write failed (with a second paragraph on what confirming again does, after a conflict), or a
   * warning `Alert` that a request whose answer was lost is kept to be sent again. It stays until
   * the app clears it, so the action row never moves under the pointer; confirming again retries
   * the write. The confirmation adds no live region of its own: the notice announces itself, as an
   * `Alert` does.
   */
  errorText?: ReactNode;
};

/**
 * The confirmation itself, the piece every confirmation is made of: the question, the write's
 * outcome, and Cancel and the action in the dialog's action row. `AlertDialog` is this piece in a
 * modal of its own; a dialog that goes on in the same modal once the person has confirmed, such as
 * one that then shows a new secret where the question stood, renders this piece inside its own
 * `Dialog`.
 *
 * The pending state is stated once, on the `DialogModal` around it, as `isDismissDisabled`: while
 * the write runs, the modal holds itself open and disables Cancel, and the action reads the same
 * fact and shows the pending spinner and ignores presses.
 */
export const Confirmation = ({
  children,
  cancelLabel,
  actionLabel,
  tone,
  onAction,
  errorText,
}: ConfirmationProps) => {
  const isPending = useIsDismissDisabled();
  const styles = confirmationStyles();
  return (
    <>
      {/* The description slot: in an alert dialog React Aria makes it the dialog's description. */}
      <Text slot='description' elementType='p' className={styles.question()}>
        {children}
      </Text>
      {errorText}
      <div className={styles.actions()}>
        <DialogCancel autoFocus={tone === 'destructive'}>
          {cancelLabel}
        </DialogCancel>
        <Button
          variant='solid'
          tone={tone}
          isPending={isPending}
          autoFocus={tone === 'primary'}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </>
  );
};
