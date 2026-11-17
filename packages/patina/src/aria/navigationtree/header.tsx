import type { ReactNode } from 'react';
import { NavigationTreeHeader as AriaNavigationTreeHeader } from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const navigationTreeHeaderStyles = tv({
  base: 'text-surface-foreground-muted px-4 pt-3 pb-1 text-xs',
  variants: { isHidden: { true: 'sr-only' } },
});

export type NavigationTreeHeaderProps = {
  children: ReactNode;
  /** Visually hidden on the collapsed rail; it still names its group. */
  isHidden?: boolean;
};

/**
 * A group's header: small, muted text over its destinations. On the collapsed rail it is visually
 * hidden (`isHidden`) and keeps naming its group.
 */
export const NavigationTreeHeader = ({
  children,
  isHidden = false,
}: NavigationTreeHeaderProps) => (
  <AriaNavigationTreeHeader
    className={navigationTreeHeaderStyles({ isHidden })}
  >
    {children}
  </AriaNavigationTreeHeader>
);
