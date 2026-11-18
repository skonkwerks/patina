import type { ReactNode } from 'react';
import {
  SeparatorContext,
  ToggleButtonGroupContext,
} from 'react-aria-components';

/**
 * Where an overlay's content begins, the contexts of what opened it end. React context passes
 * through an overlay's portal, and React Aria clears only its own contexts there, so without this a
 * control in a popover or a modal would take what the place it was opened from gives its own
 * controls: a `Toolbar`'s separator orientation (across the toolbar) and toggle group orientation.
 * `Popover` and `DialogModal` wrap their content in it, so a `Separator` or a `ToggleGroup` in an
 * overlay takes its own orientation. A context a component later provides to the controls inside
 * it is added here when a control in an overlay opened from that component could take it.
 */
export const OverlayContextBoundary = ({
  children,
}: {
  children: ReactNode;
}) => (
  <SeparatorContext value={null}>
    <ToggleButtonGroupContext value={null}>{children}</ToggleButtonGroupContext>
  </SeparatorContext>
);
