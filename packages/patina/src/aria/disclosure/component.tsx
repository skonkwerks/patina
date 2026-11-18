import type { ReactNode } from 'react';
import {
  Disclosure as AriaDisclosure,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { DISABLED } from '../../internal/disabled.ts';

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
  variants: {
    // A disabled section's trigger: its chevron and title together, under the one disabled rule.
    isDisabled: { true: { trigger: DISABLED } },
  },
});

export type DisclosureProps = Omit<AriaDisclosureProps, 'className'> & {
  children: ReactNode;
};

/** A section of a page that opens and closes: a header that is its trigger, then a panel. */
export const Disclosure = (props: DisclosureProps) => (
  <AriaDisclosure {...props} />
);
