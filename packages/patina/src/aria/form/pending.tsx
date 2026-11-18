import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.js';
import { Spinner, spinnerStyles } from '../../spinner/index.js';

/**
 * The spinner and the words at the end of a field's label line while its choices are read.
 * `…/select` and `…/combobox` re-export it, so an app extends the look from either.
 */
export const fieldPendingStyles = tv({
  slots: {
    // The spinner's place at the end of the label's line: a label line's box, kept clear of the
    // label as the row's end is (both defined once in `fieldStyles`).
    spinner: [
      fieldStyles.slots.rowEnd,
      fieldStyles.slots.labelLineBox,
      'flex shrink-0',
    ],
    // The spinner's square, kept whenever the field can be pending, drawn or not. With the place's
    // padding (4px) and the label line's gap before the place and before the words (4px each), it
    // is the room such a field keeps at the end of its label line, about 26px: the label's room is
    // then the same pending or not, so it wraps the same and the control never moves, and the
    // spinner always has its room.
    square: [spinnerStyles.variants.size.sm, 'flex'],
    // The words' place beside the spinner, a label line's box too. It takes only the room the label
    // leaves (from no width, up to the words' own), so it never narrows the label: with less room
    // the words are cut with an ellipsis, and they never wrap. When the label leaves no room at all
    // (it wraps and takes its row), the place has no width and only the spinner shows, as the
    // owner accepted for a narrow field; the words still describe the control.
    words: [
      fieldStyles.slots.labelLineBox,
      'flex max-w-max min-w-0 grow basis-0',
    ],
    // The words, centered on the label's line by their place: the field description's look,
    // defined once in `fieldStyles`, cut with an ellipsis.
    text: [fieldStyles.slots.description, 'min-w-0 truncate'],
  },
});

/**
 * The pending state of a field whose choices are read, such as a `Select`'s or a `ComboBox`'s: not
 * pending, or pending with the words that say so.
 */
export type FieldPendingProps =
  | { isPending?: false; pendingText?: undefined }
  | {
      /**
       * While the choices are still being read, a spinner and `pendingText` stand at the end of the
       * label row.
       */
      isPending: boolean;
      /**
       * What to say while pending, such as "Loading regions". The words take the room the label
       * leaves at the end of the label row, cut with an ellipsis when that is too little; the
       * spinner always shows, and stands alone when a label that wraps leaves no room (the owner's
       * accepted behavior for a narrow field). The words describe the control while pending, in
       * every case. A field given it keeps the spinner's square and its spacing (about 26px) at
       * the end of its label row, pending or not, so its label wraps the same and its control does
       * not move when its choices start or finish being read.
       */
      pendingText: string;
    };

type Props = {
  /** The words' id, which the field lists in its control's `aria-describedby` while pending. */
  id: string;
  isPending: boolean;
  pendingText: string;
};

/**
 * What a field whose choices are read keeps at the end of its label's line, defined once: the
 * spinner and `pendingText` while they are read, and the spinner's square and the words' place,
 * empty, while they are not. `Select` and `ComboBox` give it to their header (`pending`) whenever
 * they are given `pendingText`, and describe their control with the words (`id`) while pending.
 * Not a public subpath: they import it by its path.
 */
export const FieldPending = ({ id, isPending, pendingText }: Props) => {
  const styles = fieldPendingStyles();
  return (
    <>
      <span className={styles.spinner()}>
        <span className={styles.square()}>
          {/* Without a name, the spinner is decoration, hidden from assistive technology: the
            words, which describe the control, already say it, and naming the spinner too would
            say it twice. It stays so when it stands alone in a narrow field. */}
          {isPending && <Spinner size='sm' />}
        </span>
      </span>
      <span id={id} className={styles.words()}>
        <span className={styles.text()}>
          {isPending ? pendingText : undefined}
        </span>
      </span>
    </>
  );
};
