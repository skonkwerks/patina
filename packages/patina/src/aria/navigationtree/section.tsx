import type { ReactNode } from 'react';
import { NavigationTreeSection as AriaNavigationTreeSection } from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const navigationTreeSectionStyles = tv({
  base: 'not-first:border-surface-border not-first:mt-3 not-first:border-t',
});

export type NavigationTreeSectionProps = {
  id: string;
  children: ReactNode;
};

/**
 * A group of destinations under a `NavigationTreeHeader`, which names the group to assistive
 * technology. A group after the first is set off from the one above by a line, which stays on the
 * collapsed rail, where the header is hidden, so the groups still read as groups there.
 */
export const NavigationTreeSection = ({
  id,
  children,
}: NavigationTreeSectionProps) => (
  <AriaNavigationTreeSection id={id} className={navigationTreeSectionStyles()}>
    {children}
  </AriaNavigationTreeSection>
);
