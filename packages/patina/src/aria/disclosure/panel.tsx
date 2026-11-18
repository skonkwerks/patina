import type { ReactNode } from 'react';
import {
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
} from 'react-aria-components';

import { disclosureStyles } from './component.js';

const styles = disclosureStyles();

export type DisclosurePanelProps = Omit<
  AriaDisclosurePanelProps,
  'className'
> & { children: ReactNode };

/** The disclosure's content, which animates its height unless motion is reduced. */
export const DisclosurePanel = ({
  children,
  ...rest
}: DisclosurePanelProps) => (
  <AriaDisclosurePanel {...rest} className={styles.panel()}>
    <div className={styles.content()}>{children}</div>
  </AriaDisclosurePanel>
);
