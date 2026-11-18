import { tv } from 'tailwind-variants';

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
      /**
       * What to say while pending, such as "Loading regions". A field given it keeps its
       * description's place as tall as the taller of the description and this line, pending or not,
       * so the control does not move when its choices start or finish being read.
       */
      pendingText: string;
    };

/**
 * What a field whose choices are read shows in its description's place while they are, defined
 * once: the spinner and `pendingText`, so the control is described by the words that say it is not
 * ready. `Select` and `ComboBox` give it to their header (`pendingDescription`), which keeps the
 * place one height. Not a public subpath: they import it by its path.
 */
export const FieldPending = ({ pendingText }: { pendingText: string }) => (
  <span className={fieldPendingStyles()}>
    <Spinner size='sm' />
    {pendingText}
  </span>
);
