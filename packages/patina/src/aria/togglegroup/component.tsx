import {
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { GroupContext } from './context.ts';
import type { ToggleStyleProps } from './styles.ts';

/** The group's frame: its toggles sit in one row and touch. */
export const toggleGroupStyles = tv({ base: 'inline-flex' });

export type ToggleGroupProps = Omit<
  AriaToggleButtonGroupProps,
  'className' | 'selectionMode'
> & {
  /** Required: the group's accessible name, what the choice is about. */
  'aria-label': string;
  /** Single by default: one pressed at a time, never none. Multiple: any number, including none. */
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
