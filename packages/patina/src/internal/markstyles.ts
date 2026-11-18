import { tv } from 'tailwind-variants';

import { DISABLED } from './disabled.js';

/**
 * A checkbox's mark, defined once for `Checkbox`, for the options of a multiple choice
 * (`ListBoxItem`, in a `ListBox`, a `ComboBox` or a `MultiSelect`), and for a `Tree`'s and a
 * `Table`'s selection checkboxes: a square with a control's edge while off, and no fill, so it reads
 * on any layer; filled with the primary color and showing its check while on. An indeterminate
 * checkbox (a select-all whose rows are only partly selected) is filled and shows a dash in the
 * check's place. `size`: `md` (20px, a form's checkbox) or `sm` (16px, a list row's, beside a 14px
 * label). `CheckMark` draws it.
 *
 * `control-border` reaches 3:1 only on the layers and their hover fills (`patina.css`). A mark that
 * stands on the `neutral` fill (a table's select-all, in its header) is `isOnNeutral`: its edge
 * takes that fill's foreground, the header's text color, while it is off.
 */
export const checkMarkStyles = tv({
  slots: {
    box: 'border-control-border flex shrink-0 items-center justify-center rounded border',
    check: 'text-primary-foreground opacity-0',
  },
  variants: {
    size: {
      md: { box: 'size-5', check: 'size-4' },
      sm: { box: 'size-4', check: 'size-3.5' },
    },
    // Before `isSelected` and `isIndeterminate`, so their primary edge wins while the mark is on.
    isOnNeutral: { true: { box: 'border-neutral-foreground' } },
    isSelected: {
      true: { box: 'border-primary bg-primary', check: 'opacity-100' },
    },
    isIndeterminate: {
      true: { box: 'border-primary bg-primary', check: 'opacity-100' },
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * A radio's mark, defined once for `Radio` and for the selection marks of a `Table` that selects one
 * row: a circle with a control's edge and no fill, so it reads on any layer; while chosen, its edge
 * turns primary, as a checked box's does, and it shows a primary dot. The primary edge keeps 3:1 on
 * a selected row's tint, where `control-border` does not. `size`: `md` (20px, a form's radio) or `sm` (16px, a table row's, beside 14px text).
 * `RadioMark` draws it.
 */
export const radioMarkStyles = tv({
  slots: {
    box: 'border-control-border flex shrink-0 items-center justify-center rounded-full border',
    dot: 'bg-primary rounded-full opacity-0',
  },
  variants: {
    size: {
      md: { box: 'size-5', dot: 'size-2.5' },
      sm: { box: 'size-4', dot: 'size-2' },
    },
    isSelected: { true: { box: 'border-primary', dot: 'opacity-100' } },
  },
  defaultVariants: { size: 'md' },
});

/**
 * A collection's selection checkbox (`SelectionCheckbox`), around its mark: positioned, so the hidden
 * input React Aria puts inside the label stays over the mark; faded when it shows its own disabled
 * look.
 */
export const selectionCheckboxStyles = tv({
  base: 'relative flex shrink-0',
  variants: {
    isDisabled: { true: DISABLED },
  },
});
