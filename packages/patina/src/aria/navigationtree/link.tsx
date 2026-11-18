import type { ReactNode } from 'react';
import {
  Link as AriaLink,
  NavigationTreeItem as AriaNavigationTreeItem,
  NavigationTreeItemContent as AriaNavigationTreeItemContent,
  type NavigationTreeItemProps as AriaNavigationTreeItemProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from '../../internal/focus.js';
import { Tooltip, TooltipTrigger } from '../tooltip/index.js';

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
