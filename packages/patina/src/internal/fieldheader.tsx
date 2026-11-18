import type { ReactNode } from 'react';
import { Label, Text } from 'react-aria-components';

import { fieldStyles } from './field.ts';
import { FieldContextBoundary } from './fieldcontextboundary.tsx';

/** U+2060 WORD JOINER: no line may break on either side of it. */
const WORD_JOINER = '\u2060';

/**
 * What every field whose label stands above its control takes for its header, beside its `label`
 * (each field says what its own `label` names). A field's header is, from the top: the label row
 * (the label with `optionalText` inside it, then `info` beside it), then the `description`, then
 * the control; the field's error stands under the control.
 */
export type FieldHeaderProps = {
  /**
   * Text after the label for a field the person may leave empty, such as "(optional)", in the
   * layer's muted color at normal weight; Patina adds no words or punctuation of its own. It is
   * drawn only, and does not change validation: whether the field may be left empty is
   * `isRequired`. It stands inside the label, so it is part of the field's accessible name ("Path
   * to content (optional)"), and a field without a visible label shows none; a label that wraps
   * takes it onto its next line whole. Unset by default, as in a group whose heading already says
   * its fields are optional.
   */
  optionalText?: string;
  /**
   * A control beside the label, outside it (a label holds no interactive content), such as an
   * `InfoButton` that opens the app's help panel, or a link to the help. The field's own React Aria
   * contexts do not reach it, so a button here is never taken for one of the field's parts. It
   * follows the label's last word, on whatever line the label ends, and is never parted from it;
   * it makes no line taller, so a field with one starts its control where a field without one
   * does. A field in a dialog, in the modal drawer (`DialogModal` with `placement='right'`) or in
   * a form in the side drawer takes none: the help panel it opens lies behind a modal, and in the
   * side drawer it would take the form's place. Patina does not enforce this; the app leaves
   * `info` unset there.
   */
  info?: ReactNode;
  /**
   * What the field is for, in a sentence, under the label and above the control. It describes the
   * control (`aria-describedby`), so it is read when the control takes the focus.
   */
  description?: string;
};

type FieldHeaderPartsProps = FieldHeaderProps & {
  label?: string;
  /**
   * Draws the label without `label`, for React Aria to fill: a `ColorSlider` without one shows its
   * channel's name. By default the label is drawn when `label` is given and not empty.
   */
  hasLabel?: boolean;
  /**
   * The label's id, for a field that names its control itself (`ColorPicker`, `MultiSelect`); a
   * React Aria field gives its label an id through its context.
   */
  labelId?: string;
  /**
   * Inside the label, after its text and before `optionalText`: `Select`'s count, read with the
   * label.
   */
  count?: ReactNode;
  /** At the end of the label row: a slider's value, a text area's actions. */
  end?: ReactNode;
  /**
   * The description's id, for a field whose React Aria component has no description slot (a
   * slider) or that is not one React Aria field (`ColorPicker`, `MultiSelect`): the field lists it
   * in its control's `aria-describedby` itself. Without it, the description takes React Aria's
   * `description` slot, which the field wires to its control.
   */
  descriptionId?: string;
  /**
   * The pending sign of a field whose choices are read, at the end of the label's line: the
   * spinner and its words (`FieldPending`), from a `Select` or a `ComboBox` given `pendingText`.
   * Given whenever the field can be pending, and drawing nothing while it is not; the field wires
   * the words to its control itself, since they come and go after it mounts.
   */
  pending?: ReactNode;
  /** Draws the label disabled, with the field. */
  isDisabled?: boolean;
};

/**
 * The header of every field whose label stands above its control, defined once: the label row and
 * the description, in that order, rendered inside the React Aria field so that React Aria wires the
 * label and the description to the control through its slots. The field renders its control next,
 * and its error after the control. A single `Checkbox`, `Radio` or `Switch` has its label beside
 * its mark, and no header.
 *
 * The label row holds the label, its `count` and `optionalText` inside it, then `info`, then the
 * `pending` sign at the end of the label's line, and `end` at the row's far end; it is drawn when
 * there is a label, an `info`, an `end` or a `pending`. A label too long for the row wraps onto
 * further lines: `info` follows its last word, on whatever line it ends, and `pending` stands at
 * the end of its first line. The description is drawn only when there is one: a field's pending
 * sign stands in the label row, which is there anyway, so nothing is reserved for it and the
 * control never moves when it comes or goes.
 */
export const FieldHeader = ({
  label,
  hasLabel = label !== undefined && label !== '',
  labelId,
  count,
  optionalText,
  info,
  end,
  description,
  descriptionId,
  pending,
  isDisabled = false,
}: FieldHeaderPartsProps) => {
  const parts = fieldStyles({ isDisabled });
  const hasDescription = description !== undefined && description !== '';
  return (
    <>
      {(hasLabel ||
        info !== undefined ||
        end !== undefined ||
        pending !== undefined) && (
        <div className={parts.labelRow()}>
          <div className={parts.labelLine()}>
            {(hasLabel || info !== undefined) && (
              <div className={parts.labelText()}>
                {hasLabel && (
                  <Label id={labelId} className={parts.label()}>
                    {/* Without `label`, the children stay unset, so React Aria can fill the
                      label. */}
                    {label === undefined ? undefined : (
                      <>
                        {label}
                        {count}
                        {/* The space is its own text, outside the span, so that the accessible
                          name keeps it. */}
                        {optionalText !== undefined && ' '}
                        {optionalText !== undefined && (
                          <span className={parts.optional()}>
                            {optionalText}
                          </span>
                        )}
                      </>
                    )}
                  </Label>
                )}
                {info !== undefined && (
                  <>
                    {/* A word joiner, hidden from assistive technology, holds the info control
                      to the label's last word: Chromium breaks a line before an inline box even
                      in text that forbids breaks, but not before the joiner. */}
                    <span aria-hidden>{WORD_JOINER}</span>
                    <div className={parts.info()}>
                      <FieldContextBoundary>{info}</FieldContextBoundary>
                    </div>
                  </>
                )}
              </div>
            )}
            {pending}
          </div>
          {end !== undefined && <div className={parts.rowEnd()}>{end}</div>}
        </div>
      )}
      {hasDescription &&
        (descriptionId === undefined ? (
          <Text slot='description' className={parts.description()}>
            {description}
          </Text>
        ) : (
          <span id={descriptionId} className={parts.description()}>
            {description}
          </span>
        ))}
    </>
  );
};
