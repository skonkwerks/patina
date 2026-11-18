import {
  SeparatorContext,
  ToggleButtonGroupContext,
  Toolbar as AriaToolbar,
  type ToolbarProps as AriaToolbarProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * The toolbar's frame: its controls in a row that wraps, or in a column. It is as wide as its
 * controls, so a separator across a column is as wide as the column's widest control.
 */
export const toolbarStyles = tv({
  base: 'flex w-fit max-w-full flex-wrap gap-2',
  variants: {
    orientation: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col items-start',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export type ToolbarProps = Omit<AriaToolbarProps, 'className'> & {
  /** Required: what the toolbar's controls act on, such as "Text formatting". */
  'aria-label': string;
  /** Layout only. */
  className?: string;
};

/**
 * A set of controls that act on one thing, such as an editor's formatting: buttons, toggles, a
 * single-choice `ToggleGroup`, a menu trigger, grouped by `ToolbarGroup` and set apart by
 * `Separator`. React Aria gives the arrow keys along its `orientation` (Left and Right in a row, Up
 * and Down in a column) to move between its controls, crossing groups and skipping separators, and
 * Tab leaves it. Its separators run across its own direction (vertical lines in a row, horizontal
 * in a column) unless one sets its own `orientation`. A `ToggleGroup` inside it takes its
 * orientation, as React Aria's starter has it: a column of segments in a column, announced as
 * vertical, and stepped through by Up and Down. Neither reaches into a `Popover` or a `DialogModal`
 * opened from it.
 *
 * Toggles that are each on or off by themselves (Bold, Italic) are `IconToggle`s or `Toggle`s in a
 * `ToolbarGroup`, not a `ToggleGroup` with `selectionMode='multiple'`: inside a toolbar, React Aria
 * (1.22) renders such a group as a `group` that keeps an `aria-orientation`, which ARIA does not
 * allow on a group, and the accessibility check fails it.
 */
export const Toolbar = ({
  className,
  orientation = 'horizontal',
  ...rest
}: ToolbarProps) => (
  <SeparatorContext
    value={{
      orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal',
    }}
  >
    <ToggleButtonGroupContext value={{ orientation }}>
      <AriaToolbar
        {...rest}
        orientation={orientation}
        className={toolbarStyles({ orientation, className })}
      />
    </ToggleButtonGroupContext>
  </SeparatorContext>
);
