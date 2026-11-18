import type { ReactNode } from 'react';
import {
  DisclosureGroup as AriaDisclosureGroup,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/** The sections stacked one under another, each set off from the one above by a line. */
export const disclosureGroupStyles = tv({
  base: 'divide-canvas-border flex flex-col divide-y *:py-3 *:first:pt-0 *:last:pb-0',
});

export type DisclosureGroupProps = Omit<
  AriaDisclosureGroupProps,
  'className' | 'children'
> & {
  /** The `Disclosure`s, each with the `id` that `expandedKeys` holds. */
  children: ReactNode;
  /** Layout only. */
  className?: string;
};

/**
 * Related `Disclosure`s that open together, sometimes called an accordion: by default opening one
 * closes the one that was open, and `allowsMultipleExpanded` lets several stay open. `isDisabled`
 * disables every section in it.
 */
export const DisclosureGroup = ({
  className,
  ...rest
}: DisclosureGroupProps) => (
  <AriaDisclosureGroup
    {...rest}
    className={disclosureGroupStyles({ className })}
  />
);
