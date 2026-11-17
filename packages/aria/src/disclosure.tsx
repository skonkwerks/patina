import type { ReactNode } from 'react';
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
  type DisclosureProps as AriaDisclosureProps,
  Heading,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';
import { IconChevronRight } from './icons.tsx';

export const disclosureStyles = tv({
  slots: {
    heading: 'm-0 flex',
    // The size and weight of a section's heading (`Header` with `variant='section'`), so a section
    // that opens and closes sits among the page's other sections as one of them.
    trigger:
      'group/trigger inline-flex max-w-full items-center gap-1 rounded text-start text-lg font-semibold',
    chevron:
      'text-canvas-foreground-muted h-5 w-5 shrink-0 transition-transform group-aria-expanded/trigger:rotate-90 motion-reduce:transition-none',
    title: 'min-w-0 truncate',
    panel:
      'h-(--disclosure-panel-height) overflow-clip motion-safe:transition-[height]',
    content: 'flex flex-col gap-3 pt-3 text-sm',
  },
});
const styles = disclosureStyles();

export type DisclosureProps = Omit<AriaDisclosureProps, 'className'> & {
  children: ReactNode;
};

/** A section of a page that opens and closes: a header that is its trigger, then a panel. */
export const Disclosure = (props: DisclosureProps) => (
  <AriaDisclosure {...props} />
);

export type DisclosureHeaderProps = {
  /** The heading text. */
  children: string;
  /** The heading level in the page outline: 2 for a section of the page, 3 for one nested in a section. */
  level?: 2 | 3 | 4 | 5 | 6;
};

/** The section's heading, which is the button that opens and closes the panel. */
export const DisclosureHeader = ({
  children,
  level = 2,
}: DisclosureHeaderProps) => (
  <Heading level={level} className={styles.heading()}>
    <Button
      slot='trigger'
      className={(renderProps) =>
        styles.trigger({ className: focusRing(renderProps) })
      }
    >
      <IconChevronRight aria-hidden className={styles.chevron()} />
      <span className={styles.title()}>{children}</span>
    </Button>
  </Heading>
);

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
