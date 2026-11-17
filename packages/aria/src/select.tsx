import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Count } from './count.tsx';
import { focusRing } from './focus.ts';
import { IconChevronDown } from './icons.tsx';
import { Popover } from './popover.tsx';
import { Spinner } from './spinner.tsx';

export const selectStyles = tv({
  slots: {
    root: 'group flex flex-col gap-1',
    label: 'text-surface-foreground text-sm font-medium',
    count: 'text-xs',
    value: 'placeholder-shown:text-input-placeholder truncate',
    chevron: 'h-4 w-4 shrink-0',
    pending: 'text-surface-foreground-muted flex items-center gap-1.5 text-xs',
    description: 'text-surface-foreground-muted text-xs',
    error: 'text-destructive text-xs',
    popover: 'max-h-72 w-(--trigger-width) overflow-auto p-1',
    listBox: 'outline-0',
  },
});

/** The trigger, which carries the shared focus ring. */
export const selectTriggerStyles = tv({
  extend: focusRing,
  base: [
    'bg-input text-input-foreground border-input-border flex h-8 items-center justify-between gap-2 rounded-md border px-3 text-sm',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'group-data-[invalid]:border-destructive',
  ],
});

export const selectItemStyles = tv({
  base: 'flex cursor-default items-center rounded px-2 py-1.5 text-sm outline-0 select-none',
  variants: {
    isFocused: { true: 'bg-overlay-hover' },
    isSelected: { true: 'font-medium' },
    // As every disabled control reads here: half as strong, and the cursor says it cannot be chosen.
    isDisabled: { true: 'cursor-not-allowed opacity-50' },
  },
});

/**
 * The choice is given and taken as `value` and `onChange`, as React Aria's Select documents it; the
 * older `selectedKey` props it still accepts and marks deprecated are not part of the wrapper.
 */
export type SelectProps<T extends object> = Omit<
  AriaSelectProps<T>,
  | 'className'
  | 'children'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
> & {
  /** The visible label; a select in a toolbar may carry `aria-label` instead. */
  label?: string;
  /** Optional muted count beside the field label, formatted by the caller from the vocabulary. */
  count?: string;
  description?: string;
  /** While the choices are still being read: `pendingText` and a spinner stand where the description does. */
  isPending?: boolean;
  /** What to say while `isPending`, such as "Loading regions". */
  pendingText?: string;
  errorMessage?: string;
  items: Iterable<T>;
  children: (item: T) => React.ReactNode;
  className?: string;
};

/** A labeled single-choice dropdown: a trigger showing the chosen item and a list in a popover. */
export const Select = <T extends object>({
  label,
  count,
  description,
  isPending = false,
  pendingText,
  errorMessage,
  items,
  children,
  className,
  ...rest
}: SelectProps<T>) => {
  const styles = selectStyles();
  return (
    <AriaSelect
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and `isRequired`, so it is set only
      // for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={styles.root({ className })}
    >
      {label && (
        <Label className={styles.label()}>
          {label}
          {count !== undefined && (
            <Count text={count} className={styles.count()} />
          )}
        </Label>
      )}
      <Button className={(renderProps) => selectTriggerStyles(renderProps)}>
        {/* With nothing chosen, React Aria shows the `placeholder` prop, or its own "Select an item". */}
        <SelectValue className={styles.value()} />
        <IconChevronDown className={styles.chevron()} aria-hidden />
      </Button>
      {isPending ? (
        <Text slot='description' className={styles.pending()}>
          <Spinner size='sm' />
          {pendingText}
        </Text>
      ) : (
        description && (
          <Text slot='description' className={styles.description()}>
            {description}
          </Text>
        )
      )}
      <FieldError className={styles.error()}>{errorMessage}</FieldError>
      <Popover className={styles.popover()}>
        <ListBox items={items} className={styles.listBox()}>
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
};

export type SelectItemProps = Omit<ListBoxItemProps, 'className'>;

export const SelectItem = (props: SelectItemProps) => (
  <ListBoxItem
    {...props}
    className={({ isFocused, isSelected, isDisabled }) =>
      selectItemStyles({ isFocused, isSelected, isDisabled })
    }
  />
);
