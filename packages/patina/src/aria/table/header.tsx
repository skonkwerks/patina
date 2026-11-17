import {
  TableHeader as AriaTableHeader,
  type TableHeaderProps as AriaTableHeaderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const tableHeaderStyles = tv({
  base: 'bg-neutral text-neutral-foreground border-surface-border border-b',
});

export type TableHeaderProps<T extends object> = Omit<
  AriaTableHeaderProps<T>,
  'className'
>;

export const TableHeader = <T extends object>(props: TableHeaderProps<T>) => (
  <AriaTableHeader {...props} className={tableHeaderStyles()} />
);
