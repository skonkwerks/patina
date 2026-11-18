import { Text } from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.ts';
import { Spinner } from '../../spinner/index.ts';

/**
 * The spinner and the words that stand where a field's description does while its choices are
 * read. `…/select` and `…/combobox` re-export it, so an app extends the look from either.
 */
export const fieldPendingStyles = tv({
  base: 'text-surface-foreground-muted flex items-center gap-1.5 text-xs',
});

/**
 * The pending state of a field whose choices are read, such as a `Select`'s or a `ComboBox`'s: not
 * pending, or pending with the words that say so.
 */
export type FieldPendingProps =
  | { isPending?: false; pendingText?: undefined }
  | {
      /** While the choices are still being read, `pendingText` and a spinner stand where the description does. */
      isPending: boolean;
      /** What to say while pending, such as "Loading regions". */
      pendingText: string;
    };

type FieldDescriptionProps = {
  description?: string;
  isPending: boolean;
  pendingText?: string;
};

/**
 * What a field shows under its control, defined once for the fields whose choices are read: its
 * description, or, while the choices are read, the spinner and `pendingText` in the description's
 * place, so the control is described by the words that say it is not ready. Not a public subpath:
 * `Select` and `ComboBox` import it by its path.
 */
export const FieldDescription = ({
  description,
  isPending,
  pendingText,
}: FieldDescriptionProps) => {
  if (isPending && pendingText !== undefined) {
    return (
      <Text slot='description' className={fieldPendingStyles()}>
        <Spinner size='sm' />
        {pendingText}
      </Text>
    );
  }
  return description ? (
    <Text slot='description' className={fieldStyles().description()}>
      {description}
    </Text>
  ) : null;
};
