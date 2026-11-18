import { type ReactElement, type ReactNode, use } from 'react';
import {
  Collection,
  Header,
  ListBoxSection as AriaListBoxSection,
  type ListBoxSectionProps as AriaListBoxSectionProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { ListBoxLayerContext } from './layer.ts';

/**
 * A titled group of options. Its heading stays at the top of the list while the group's options
 * scroll under it, on the fill of the layer the list stands on.
 */
export const listBoxSectionStyles = tv({
  slots: {
    root: 'flex flex-col',
    header: 'sticky top-0 z-10 px-2 pt-2 pb-1 text-xs font-medium',
  },
  variants: {
    layer: {
      overlay: { header: 'bg-overlay text-overlay-foreground-muted' },
      surface: { header: 'bg-surface text-surface-foreground-muted' },
    },
  },
  defaultVariants: { layer: 'overlay' },
});

export type ListBoxSectionProps<T extends object> = Omit<
  AriaListBoxSectionProps<T>,
  'className' | 'children'
> & {
  /** The section's heading, shown above its options; it also names the group. */
  title: string;
  /** The options: `ListBoxItem`s, or a function that renders one for each of `items`. */
  children: ReactNode | ((item: T) => ReactElement);
};

/** A titled group of options inside a `ListBox`, a `Select` or a `ComboBox`. */
export const ListBoxSection = <T extends object>({
  title,
  items,
  dependencies,
  children,
  ...rest
}: ListBoxSectionProps<T>) => {
  const styles = listBoxSectionStyles({ layer: use(ListBoxLayerContext) });
  return (
    <AriaListBoxSection {...rest} className={styles.root()}>
      <Header className={styles.header()}>{title}</Header>
      <Collection items={items} dependencies={dependencies}>
        {children}
      </Collection>
    </AriaListBoxSection>
  );
};
