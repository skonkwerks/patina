import {
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { GroupContext } from './context.js';
import type { ToggleStyleProps } from './styles.js';

/**
 * The group's frame: its toggles touch, in a row, or in a column when React Aria's orientation is
 * vertical (`orientation`, or a vertical `Toolbar` around it). Its segments read the orientation
 * from the same attribute, so what is drawn and what assistive technology hears agree.
 */
export const toggleGroupStyles = tv({
  base: 'group/segments inline-flex data-[orientation=vertical]:flex-col',
});

export type ToggleGroupProps = Omit<
  AriaToggleButtonGroupProps,
  'className' | 'selectionMode'
> & {
  /** Required: the group's accessible name, what the choice is about. */
  'aria-label': string;
  /**
   * Single by default: one pressed at a time, never none. Multiple: any number, including none.
   * Inside a `Toolbar`, toggles that are each on or off by themselves are `IconToggle`s or `Toggle`s
   * in a `ToolbarGroup` instead: React Aria (1.22) renders a multiple group in a toolbar as a
   * `group` with an `aria-orientation`, which ARIA does not allow, and the accessibility check fails.
   */
  selectionMode?: 'single' | 'multiple';
  /** The size of every toggle in the group. */
  size?: ToggleStyleProps['size'];
  className?: string;
};

/**
 * A segmented group of toggles: the segments touch, only the outer corners are rounded, so the group
 * reads as one control. Single-choice unless told otherwise; assistive technology hears which are pressed.
 */
export const ToggleGroup = ({
  className,
  selectionMode = 'single',
  size,
  ...rest
}: ToggleGroupProps) => (
  <GroupContext value={{ isInGroup: true, size }}>
    <AriaToggleButtonGroup
      {...rest}
      selectionMode={selectionMode}
      disallowEmptySelection={selectionMode === 'single'}
      className={toggleGroupStyles({ className })}
    />
  </GroupContext>
);
