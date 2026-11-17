import {
  Form as AriaForm,
  type FormProps as AriaFormProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const formStyles = tv({ base: 'flex min-w-0 flex-col gap-4' });

export type FormProps = Omit<AriaFormProps, 'onSubmit' | 'className'> & {
  /** Called on submit, only when every field is valid: the submit button, or Enter in a field. */
  onSubmit: () => void;
  className?: string;
};

/**
 * A form, on a page or in a dialog. React Aria validates every field on submit; when one is
 * invalid, nothing is submitted, each invalid field shows its error, and focus moves to the first
 * of them. Every other React Aria prop passes through, such as `validationErrors` for a server's
 * answer about one field.
 */
export const Form = ({ onSubmit, className, ...props }: FormProps) => (
  <AriaForm
    {...props}
    className={formStyles({ className })}
    onSubmit={(event) => {
      event.preventDefault();
      // A dialog's portal stays a descendant in React's event tree, though not in the DOM:
      // submitting a form inside it must never also submit a form behind it.
      event.stopPropagation();
      if (event.target === event.currentTarget) {
        onSubmit();
      }
    }}
  />
);
