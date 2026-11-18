import type { ReactNode } from 'react';
import { Group } from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * A group lays its controls out as the toolbar does, in its direction, alignment, spacing and
 * wrapping, so grouping changes what assistive technology hears and nothing of what is seen.
 */
export const toolbarGroupStyles = tv({
  base: 'flex [flex-direction:inherit] [flex-wrap:inherit] [align-items:inherit] [gap:inherit]',
});

export type ToolbarGroupProps = {
  /** Required: what the group's controls have in common, such as "Clipboard". */
  'aria-label': string;
  /** The group's controls. */
  children: ReactNode;
  /** Layout only. */
  className?: string;
};

/**
 * Related controls of a `Toolbar`, named as a group for assistive technology, such as Copy, Cut and
 * Paste, or the Bold, Italic and Underline toggles. The toolbar's arrow keys pass through it as
 * through the rest of the toolbar. A set of toggles that is one choice is a `ToggleGroup` instead,
 * which is already a group.
 */
export const ToolbarGroup = ({ className, ...rest }: ToolbarGroupProps) => (
  <Group {...rest} className={toolbarGroupStyles({ className })} />
);
