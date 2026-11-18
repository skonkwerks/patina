import type { ReactNode } from 'react';
import {
  Form as AriaForm,
  type FormProps as AriaFormProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * The form's column of fields, then its foot: the message of a rejected submit, directly above the
 * action row, which stands at the end of the line.
 */
export const formStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-4',
    foot: 'flex flex-col gap-3',
    actions: 'flex flex-wrap items-center justify-end gap-2',
  },
});

export type FormProps = Omit<AriaFormProps, 'onSubmit' | 'className'> & {
  /** Called on submit, only when every field is valid: the submit button, or Enter in a field. */
  onSubmit: () => void;
  /**
   * The action row at the form's foot, at the end of the line: Cancel, then the form's one action
   * (its submit button); on a later step of a dialog of steps, Back takes Cancel's place. No action
   * stands at the start of the row. On a page or in the side panel the app's `FormActions` fills
   * it; in a dialog, centered or the modal drawer (`placement='right'`), it is the dialog's own
   * action row: its `DialogCancel`, then the action.
   */
  actions?: ReactNode;
  /**
   * The message of a rejected submit, such as the server's refusal, directly above the action row,
   * where it is not hidden under the buttons. It stays until the next submit: a message that went
   * when a field changed or was left would move the action row from under the pointer just as the
   * submit button is pressed, and the press would be lost. The form adds no live region of its
   * own: the message announces itself, as an error `Alert` does.
   */
  errorText?: ReactNode;
  className?: string;
};

/**
 * A form, on a page or in a dialog: its fields (the children) in one column, then `errorText` and
 * the `actions` row at its foot. React Aria validates every field on submit; when one is invalid,
 * nothing is submitted, each invalid field shows its error, and focus moves to the first of them.
 * Every other React Aria prop passes through, such as `validationErrors` for a server's answer
 * about one field.
 */
export const Form = ({
  onSubmit,
  actions,
  errorText,
  className,
  children,
  ...props
}: FormProps) => {
  const styles = formStyles();
  return (
    <AriaForm
      {...props}
      className={styles.root({ className })}
      onSubmit={(event) => {
        event.preventDefault();
        // A dialog's portal stays a descendant in React's event tree, though not in the DOM:
        // submitting a form inside it must never also submit a form behind it.
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onSubmit();
        }
      }}
    >
      {children}
      {(errorText !== undefined || actions !== undefined) && (
        <div className={styles.foot()}>
          {errorText}
          {actions !== undefined && (
            <div className={styles.actions()}>{actions}</div>
          )}
        </div>
      )}
    </AriaForm>
  );
};
