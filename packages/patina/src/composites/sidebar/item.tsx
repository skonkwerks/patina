import { IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useLocale } from 'react-aria-components';

import { NavigationTreeLink } from '../../aria/navigationtree/index.ts';
import { Count } from '../../count/index.ts';
import type { StatusTone } from '../../internal/statustone.ts';
import { Spinner } from '../../spinner/index.ts';
import { useSidebar } from './context.ts';
import { sidebarItemStyles } from './styles.ts';

/** An alert on an item: something of the destination needs the person (`warning`) or has failed (`error`). */
export type SidebarItemAlert = Readonly<{
  tone: Extract<StatusTone, 'warning' | 'error'>;
  /** What the alert says, for assistive technology and the rail's tooltip, such as "Needs attention". */
  label: string;
}>;

export type SidebarItemProps = {
  /** Where the item leads; also what identifies it in the tree. */
  href: string;
  /** The icon before the name, such as a Tabler icon with `aria-hidden`; the item sizes it. */
  icon: ReactNode;
  /** The destination's name. */
  label: string;
  /** How many of its things there are, formatted by the caller, such as "(3)". */
  count?: string;
  /** An alert mark after the name, in its tone, with its words for assistive technology. */
  alert?: SidebarItemAlert;
  /**
   * The current page is below this destination (an item's own page): the item is marked as the
   * current one, and announced as the current location rather than the current page.
   */
  isCurrentSection?: boolean;
} & (
  | { isPending?: false; pendingText?: undefined }
  | {
      /** Something of the destination is at work: a spinner after the name. */
      isPending: boolean;
      /** What is at work, for assistive technology and the rail's tooltip, such as "Working". */
      pendingText: string;
    }
);

const ALERT_ICONS = { warning: IconAlertTriangle, error: IconAlertCircle };

/**
 * One destination in a `SidebarGroup`, laid out the same in every app: its icon, its name, then,
 * each only when given and always in this order, its count, its spinner and its alert mark. The
 * current page is marked by the tree (`aria-current='page'`), a current section by
 * `isCurrentSection` (`aria-current='location'`). On the rail the name and what follows it are
 * visually hidden but stay the link's name, which shows as its tooltip on hover and keyboard
 * focus; an alert is then a dot on the icon's corner.
 */
export const SidebarItem = ({
  href,
  icon,
  label,
  count,
  alert,
  isCurrentSection = false,
  isPending = false,
  pendingText,
}: SidebarItemProps) => {
  const { isCollapsed } = useSidebar();
  const { locale } = useLocale();
  const styles = sidebarItemStyles({ isCollapsed, alertTone: alert?.tone });
  // The link's name, its typeahead text and the rail's tooltip: the name and everything after it,
  // in words, listed as the locale lists them ("Jobs, Working" in English).
  const name = new Intl.ListFormat(locale, {
    type: 'unit',
    style: 'short',
  }).format([
    count === undefined ? label : `${label} ${count}`,
    ...(isPending && pendingText !== undefined ? [pendingText] : []),
    ...(alert === undefined ? [] : [alert.label]),
  ]);
  const AlertIcon = alert === undefined ? null : ALERT_ICONS[alert.tone];
  return (
    <NavigationTreeLink
      id={href}
      href={href}
      textValue={name}
      tooltip={isCollapsed ? name : undefined}
      isCurrentSection={isCurrentSection}
    >
      <span className={styles.iconFrame()}>
        {icon}
        {alert !== undefined && isCollapsed && (
          <span aria-hidden className={styles.alertDot()} />
        )}
      </span>
      {/* What is seen: the name and the marks after it. The link's name is the words below. */}
      <span aria-hidden className={styles.text()}>
        {label}
        {count !== undefined && (
          <Count text={count} className={styles.count()} />
        )}
        {isPending && <Spinner size='sm' className={styles.spinner()} />}
        {AlertIcon !== null && <AlertIcon className={styles.alertIcon()} />}
      </span>
      <span className='sr-only'>{name}</span>
    </NavigationTreeLink>
  );
};
