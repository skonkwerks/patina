import type { ReactNode } from 'react';
import {
  Link as AriaLink,
  NavigationTree as AriaNavigationTree,
  NavigationTreeHeader as AriaNavigationTreeHeader,
  NavigationTreeItem as AriaNavigationTreeItem,
  NavigationTreeItemContent as AriaNavigationTreeItemContent,
  type NavigationTreeItemProps as AriaNavigationTreeItemProps,
  type NavigationTreeProps as AriaNavigationTreeProps,
  NavigationTreeSection as AriaNavigationTreeSection,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';
import { Tooltip, TooltipTrigger } from './tooltip.tsx';

export const navigationTreeStyles = tv({ base: 'flex flex-col outline-0' });

export type NavigationTreeProps<T extends object> = Omit<
  AriaNavigationTreeProps<T>,
  'className'
> & {
  /** Layout only. */
  className?: string;
};

/**
 * Navigation through a set of destinations. React Aria supplies the tree semantics, arrow-key
 * movement, typeahead, and `aria-current='page'` on the item whose `href` matches `selectedRoute`,
 * which is the current page's path.
 * Place it inside a `<nav>` landmark with an `aria-label`.
 */
export const NavigationTree = <T extends object>({
  className,
  ...props
}: NavigationTreeProps<T>) => (
  <AriaNavigationTree
    {...props}
    className={navigationTreeStyles({ className })}
  />
);

// The current item carries an edge marker and the full text color; the others are muted until
// hovered. Each state sets its own border color, so no base class competes with it.
export const navigationTreeLinkStyles = tv({
  extend: focusRing,
  base: 'relative flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-r-2 px-4 py-2 text-sm font-medium -outline-offset-2 transition-colors',
  variants: {
    isActive: {
      true: 'border-primary text-surface-foreground',
      false:
        'text-surface-foreground-muted hover:text-surface-foreground border-transparent',
    },
  },
});

export const navigationTreeItemStyles = tv({ base: 'outline-0' });

export const navigationTreeSectionStyles = tv({
  base: 'not-first:border-surface-border not-first:mt-3 not-first:border-t',
});

export const navigationTreeHeaderStyles = tv({
  base: 'text-surface-foreground-muted px-4 pt-3 pb-1 text-xs',
  variants: { isHidden: { true: 'sr-only' } },
});

export type NavigationTreeLinkProps = Omit<
  AriaNavigationTreeItemProps,
  'children' | 'className' | 'focusMode'
> & {
  /** The link's content: an icon and the destination's name. */
  children: ReactNode;
  /** Shown beside the link on hover and focus; for a rail where the name is visually hidden. */
  tooltip?: string;
  /**
   * The current page is below this destination: the item is marked like the current one, and the
   * link is announced as the current location rather than the current page.
   */
  isCurrentSection?: boolean;
};

/**
 * One destination. Focus moves to the link itself, so a tooltip shows on keyboard focus as well as on
 * hover.
 */
export const NavigationTreeLink = ({
  children,
  tooltip,
  isCurrentSection = false,
  ...props
}: NavigationTreeLinkProps) => (
  <AriaNavigationTreeItem
    {...props}
    focusMode='child'
    className={navigationTreeItemStyles()}
  >
    <AriaNavigationTreeItemContent>
      {({ isCurrent }) => (
        // The trigger is always rendered and only disabled while there is no tooltip, so the link
        // is one element for its whole life, as a button under `ButtonTooltip` is.
        <TooltipTrigger isDisabled={tooltip === undefined}>
          <AriaLink
            aria-current={
              !isCurrent && isCurrentSection ? 'location' : undefined
            }
            className={(state) =>
              navigationTreeLinkStyles({
                ...state,
                isActive: isCurrent || isCurrentSection,
              })
            }
          >
            {children}
          </AriaLink>
          {tooltip !== undefined && (
            <Tooltip placement='right'>{tooltip}</Tooltip>
          )}
        </TooltipTrigger>
      )}
    </AriaNavigationTreeItemContent>
  </AriaNavigationTreeItem>
);

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
