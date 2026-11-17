import {
  Tab as AriaTab,
  type TabProps as AriaTabProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';
import { focusRing } from '../../internal/focus.ts';

export const tabStyles = tv({
  extend: focusRing,
  base: 'cursor-pointer border-b-2 px-3 py-2 text-sm font-medium',
  variants: {
    isSelected: {
      true: 'border-primary text-canvas-foreground',
      false:
        'text-canvas-foreground-muted hover:text-canvas-foreground border-transparent',
    },
    isDisabled: { true: DISABLED },
  },
});

export type TabProps = Omit<AriaTabProps, 'className'> & { className?: string };

export const Tab = ({ className, ...props }: TabProps) => (
  <AriaTab
    {...props}
    className={(state) => tabStyles({ ...state, className })}
  />
);
