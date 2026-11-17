import { type ReactNode, use } from 'react';
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';

import { GroupContext } from './context.ts';
import { iconToggleStyles, type ToggleStyleProps } from './styles.ts';

export type IconToggleProps = Omit<
  AriaToggleButtonProps,
  'className' | 'children'
> &
  ToggleStyleProps & {
    /** Required: the toggle's accessible name, since it shows only an icon. */
    'aria-label': string;
    /** The icon, given the state so it can show it (a heart that fills when on). */
    children: (state: { isSelected: boolean }) => ReactNode;
  };

/**
 * A toggle showing only an icon, with a required name. On its own it is ghost by default: no outline
 * and no fill, the icon itself shows on or off. In a `ToggleGroup` it is a square segment, such as a
 * view switcher's grid and list icons. Its sizes match `IconButton`'s, so the two sit side by side.
 */
export const IconToggle = ({ variant, size, ...props }: IconToggleProps) => {
  const group = use(GroupContext);
  return (
    <AriaToggleButton
      {...props}
      className={(renderProps) =>
        iconToggleStyles({
          ...renderProps,
          variant: variant ?? (group.isInGroup ? 'outline' : 'ghost'),
          size: size ?? group.size,
          isInGroup: group.isInGroup,
        })
      }
    />
  );
};
