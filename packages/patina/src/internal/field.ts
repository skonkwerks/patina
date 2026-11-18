import { tv } from 'tailwind-variants';

import { DISABLED } from './disabled.js';
import { focusRing } from './focus.js';

/**
 * The box of a part beside a field's label, defined once: one label line tall (the label's
 * `text-sm` line, 20px), with what it holds centered on that line. The info control stands in one,
 * and so do a pending field's spinner and words (`fieldPendingStyles`).
 */
const labelLineBox = 'h-5 items-center';

/**
 * The parts every field draws around its control, defined once, in the column `root` stacks from
 * the top: the label row (`labelRow`: the `labelLine`, which holds the `labelText`, the `label`
 * with the `optional` text inside it and the field's `info` control after it, and a pending field's
 * sign at its end, each part beside the label in a `labelLineBox`; then what a field keeps at the
 * row's end, `rowEnd`), the `description`, the field's control, and the `error` under the control.
 * `FieldHeader` draws the label row and the description with these slots for every field whose
 * label stands above its control, and every such field stacks them in `root`'s column, so the
 * fields' headers cannot drift apart.
 *
 * A disabled field is drawn disabled part by part: its label here, its box in `fieldBoxStyles`. No
 * container is faded, because a faded container around a faded part would compound the two (a
 * disabled checkbox group also disables each of its checkboxes). Its description and error keep
 * their colors: text that is not the label of a disabled control keeps its contrast, which a
 * fade would break.
 */
export const fieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-1',
    labelRow: 'flex items-center gap-1',
    // The label's text, and a pending field's sign at the end of its first line.
    labelLine: 'flex min-w-0 flex-1 items-start gap-1',
    // The label and its info control, as one run of text. A label too long for its row wraps
    // between its words (it is never cut), and the info control follows its last word on whatever
    // line it ends: no line may break between them (this rule, with the word joiner `FieldHeader`
    // puts before the control), only inside the label, so a last word with no room for the
    // control takes it onto the next line, and the control never stands alone at a line's start.
    // The label's text size gives every line the label's height.
    labelText: 'text-sm whitespace-nowrap',
    label: 'text-surface-foreground text-sm font-medium whitespace-normal',
    // Inside the label, after its text: quieter than the label, at the label's size. It wraps with
    // the label's words, but as one piece, so a marker of several words is never split.
    optional: 'text-surface-foreground-muted font-normal whitespace-nowrap',
    // The box of a part beside the label (`labelLineBox`, above), for the styles that draw such a
    // part outside this one to build theirs from.
    labelLineBox,
    // Right after the label's last word, in a label line's box, with the info control centered on
    // that line. The control keeps its whole box, an `InfoButton`'s 28px with its press area and
    // hover fill, which reaches 4px above and below the line (into the column's gap below, and,
    // when the label wraps, over the foot of the label's line above), so it makes no line taller:
    // a row with an info control is as tall as one without, and fields beside each other start
    // their controls level. The box ends where the gap does, short of the description or the
    // control below it; only its focus ring, 4px outside the box and drawn on top, reaches past
    // the gap, over the top of the line below, while the control has the keyboard's focus.
    info: [labelLineBox, 'ms-1 inline-flex align-top'],
    rowEnd: 'ms-auto ps-1',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-error text-xs',
  },
  variants: {
    isDisabled: { true: { label: DISABLED } },
  },
});

/**
 * The input box, defined once: every field's box extends it with its own height and padding. It
 * carries the shared focus ring, and the invalid and disabled states from React Aria's render
 * state. Its text size is every field's: what is typed or shown inside the box (an input, a date's
 * segments, a trigger's text) takes it from the box and does not restate it, so a change here
 * reaches every field.
 */
export const fieldBoxStyles = tv({
  extend: focusRing,
  base: 'bg-input text-input-foreground border-control-border rounded-md border text-sm',
  variants: {
    isInvalid: { true: 'border-error' },
    isDisabled: { true: DISABLED },
  },
});

/**
 * A small control inside the field box, beside the text, defined once: the search field's clear
 * control and the combo box's chevron. It is quieter than the text until hovered and carries the
 * shared focus ring. A disabled field fades its whole box, this control with it, so it draws no
 * fade of its own; disabled, it only stops brightening under the pointer and shows the cursor of
 * a control that cannot be used. The date picker's calendar button is not drawn with it: React Aria
 * makes that button a Tab stop, so it is a ghost icon button with its own focus ring and hover
 * fill, while these two controls stay out of the Tab order.
 */
export const fieldButtonStyles = tv({
  extend: focusRing,
  base: 'text-surface-foreground-muted hover:text-surface-foreground flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded',
  variants: {
    isDisabled: {
      true: 'hover:text-surface-foreground-muted cursor-not-allowed',
    },
  },
});

/**
 * A choice control in two columns, the mark and the text, defined once for `Checkbox`, `Radio` and
 * `Switch`: the button spans both and lays its mark and label on them (a subgrid), so the
 * description below stands under the label without restating the mark's width. Each control extends
 * the `mark` slot with its own shape (a box, a circle, a track) and draws the shared focus ring on
 * it with `focusRing`.
 *
 * Disabled, the button (the mark with its label, the label of a disabled control) fades; the
 * description and the error keep their contrast.
 */
export const choiceControlStyles = tv({
  slots: {
    root: 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-sm',
    // Positioned, so the hidden input React Aria puts inside the label stays over it.
    button: 'group relative col-span-2 grid grid-cols-subgrid items-start',
    mark: 'mt-0.5 flex h-5 shrink-0 items-center',
    label: 'text-surface-foreground font-medium',
    // The field description's and error's looks, defined once in `fieldStyles`, in the text column.
    description: [fieldStyles.slots.description, 'col-start-2'],
    error: [fieldStyles.slots.error, 'col-start-2'],
  },
  variants: {
    isDisabled: { true: { button: DISABLED } },
  },
});
