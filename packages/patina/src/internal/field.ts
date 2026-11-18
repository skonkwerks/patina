import { tv } from 'tailwind-variants';

import { DISABLED } from './disabled.ts';
import { focusRing } from './focus.ts';

/**
 * The parts every field draws around its control, defined once: the column, the label (with an
 * optional help control beside it), the description, and the error. `TextField`, `TextArea`,
 * `NumberField`, `SearchField`, `Select`, `MultiSelect`, `CheckboxGroup`, `RadioGroup`, and `Slider`
 * use these slots, so their labels and help text cannot drift apart.
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
    label: 'text-surface-foreground text-sm font-medium',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-error text-xs',
  },
  variants: {
    isDisabled: { true: { label: DISABLED } },
  },
});

/**
 * The input box, defined once: the text field's input, the text area, the number field's box, the
 * select's and the multi-select's trigger, and the search field's box. Each component extends it
 * with its own height and padding. It carries the shared focus ring, and the invalid and disabled
 * states from React Aria's render state.
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
    description: 'text-surface-foreground-muted col-start-2 text-xs',
    error: 'text-error col-start-2 text-xs',
  },
  variants: {
    isDisabled: { true: { button: DISABLED } },
  },
});
