import {
  ListBox as AriaListBox,
  type ListBoxProps as AriaListBoxProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.ts';
import { ListBoxLayerContext } from './layer.ts';

/**
 * The list on the page: a framed column of options on the surface. It carries the shared focus ring
 * for when it holds the focus itself, which it does while it is empty; otherwise the focus is on an
 * option.
 */
export const listBoxStyles = tv({
  extend: focusRing,
  base: 'bg-surface border-surface-border flex flex-col overflow-auto rounded-lg border p-1',
});

/**
 * The line a list of options shows while it has none, defined once for the standalone `ListBox`
 * (it has no options), a `ComboBox`'s and a `MultiSelect`'s (nothing matches the typed text): an
 * option's room, in the muted text of the layer the list stands on.
 */
export const listBoxEmptyStyles = tv({
  base: 'px-2 py-1.5 text-sm',
  variants: {
    layer: {
      overlay: 'text-overlay-foreground-muted',
      surface: 'text-surface-foreground-muted',
    },
  },
  defaultVariants: { layer: 'overlay' },
});

export type ListBoxProps<T extends object> = Omit<
  AriaListBoxProps<T>,
  | 'className'
  | 'renderEmptyState'
  | 'layout'
  | 'orientation'
  | 'aria-label'
  | 'aria-labelledby'
> &
  (
    | {
        /** What the list holds; every list has an accessible name. */
        'aria-label': string;
        'aria-labelledby'?: undefined;
      }
    | {
        'aria-label'?: undefined;
        /** The id of a visible heading that names the list. */
        'aria-labelledby': string;
      }
  ) & {
    /** What the list says while it has no options, such as "No projects yet". */
    emptyLabel?: string;
    /** Layout only: width, height, and placement. A list taller than its height scrolls. */
    className?: string;
  };

/**
 * A list of options to choose from, standing on the page rather than in a popover: one Tab stop,
 * arrow keys and typeahead between options, and single or multiple selection. Its options are
 * `ListBoxItem`s, grouped by `ListBoxSection`. A list of units with actions of their own is a
 * `GridList`; an option never holds a control.
 */
export const ListBox = <T extends object>({
  emptyLabel,
  className,
  ...rest
}: ListBoxProps<T>) => (
  <ListBoxLayerContext value='surface'>
    <AriaListBox
      {...rest}
      className={({ isFocusVisible }) =>
        listBoxStyles({ isFocusVisible, className })
      }
      renderEmptyState={
        emptyLabel === undefined
          ? undefined
          : () => (
              <p className={listBoxEmptyStyles({ layer: 'surface' })}>
                {emptyLabel}
              </p>
            )
      }
    />
  </ListBoxLayerContext>
);
