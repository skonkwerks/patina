import {
  Button as AriaButton,
  Input,
  Label,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus.ts';
import { IconSearch, IconX } from './icons.tsx';

export const searchFieldStyles = tv({
  slots: {
    root: 'group flex flex-col gap-1',
    label: 'text-surface-foreground text-sm font-medium',
    group: [
      'bg-input text-input-foreground border-input-border flex h-8 items-center gap-2 rounded-md border px-2',
      'group-focus-within:outline-focus-ring group-focus-within:outline-2 group-focus-within:outline-offset-2',
    ],
    icon: 'text-surface-foreground-muted h-4 w-4 shrink-0',
    input:
      'placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-sm outline-0 [&::-webkit-search-cancel-button]:hidden',
    clearIcon: 'h-3.5 w-3.5',
  },
});

/** The clear control, which carries the shared focus ring. */
export const searchFieldClearStyles = tv({
  extend: focusRing,
  base: 'text-surface-foreground-muted hover:text-surface-foreground flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded group-empty:invisible',
});

export type SearchFieldProps = Omit<
  AriaSearchFieldProps,
  'className' | 'onSubmit'
> & {
  /** What Enter does; by default nothing, so a search inside a form never submits the form. */
  onSubmit?: (value: string) => void;
  /** The visible label; a field in a toolbar may carry `aria-label` instead. */
  label?: string;
  placeholder?: string;
  className?: string;
};

/**
 * A search box: a magnifying glass at the start, the text, and a clear control once there is text.
 * Escape clears it, as React Aria's search field does.
 */
export const SearchField = ({
  label,
  placeholder,
  className,
  onSubmit,
  ...rest
}: SearchFieldProps) => {
  const styles = searchFieldStyles();
  return (
    <AriaSearchField
      {...rest}
      // React Aria prevents the Enter default only when it has a submit handler to call.
      onSubmit={onSubmit ?? (() => undefined)}
      className={styles.root({ className })}
    >
      {label && <Label className={styles.label()}>{label}</Label>}
      <div className={styles.group()}>
        <IconSearch aria-hidden className={styles.icon()} />
        <Input placeholder={placeholder} className={styles.input()} />
        {/* React Aria names the clear button ("Clear search") through the search field's context. */}
        <AriaButton
          className={(renderProps) => searchFieldClearStyles(renderProps)}
        >
          <IconX aria-hidden className={styles.clearIcon()} />
        </AriaButton>
      </div>
    </AriaSearchField>
  );
};
