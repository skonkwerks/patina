import { type ReactNode, use } from 'react';
import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';

import { GroupContext } from './context.ts';
import { type ToggleStyleProps, toggleStyles } from './styles.ts';

export type ToggleProps = Omit<AriaToggleButtonProps, 'className'> &
  ToggleStyleProps & {
    children: ReactNode;
  };

/** A toggle with a text label: on its own, or one segment of a `ToggleGroup` (which also sets its size). A toggle that shows only an icon is an `IconToggle`. */
export const Toggle = ({ variant, size, ...props }: ToggleProps) => {
  const group = use(GroupContext);
  return (
    <AriaToggleButton
      {...props}
      className={(renderProps) =>
        toggleStyles({
          ...renderProps,
          variant,
          size: size ?? group.size,
          isInGroup: group.isInGroup,
        })
      }
    />
  );
};
