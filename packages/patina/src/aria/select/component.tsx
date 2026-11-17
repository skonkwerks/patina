import { IconChevronDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  Button,
  FieldError,
  Label,
  ListBox,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Count } from '../../count/index.ts';
import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import { Spinner } from '../../spinner/index.ts';
import { Popover } from '../popover/index.ts';

export const selectStyles = tv({
  slots: {
    // `group` lets the trigger draw the invalid border React Aria marks on the field.
    root: 'group',
    count: 'text-xs',
    value: 'placeholder-shown:text-input-placeholder truncate',
    chevron: 'h-4 w-4 shrink-0',
    pending: 'text-surface-foreground-muted flex items-center gap-1.5 text-xs',
    popover: 'max-h-72 w-(--trigger-width) overflow-auto p-1',
    listBox: 'outline-0',
  },
});

/** The trigger: the shared field box, with the invalid border React Aria marks on the field. */
export const selectTriggerStyles = tv({
  extend: fieldBoxStyles,
  base: 'group-data-[invalid]:border-destructive flex h-8 items-center justify-between gap-2 px-3',
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
  errorMessage?: string;
  items: Iterable<T>;
  children: (item: T) => ReactNode;
  className?: string;
} & (
    | { isPending?: false; pendingText?: undefined }
    | {
        /** While the choices are still being read, `pendingText` and a spinner stand where the description does. */
        isPending: boolean;
        /** What to say while pending, such as "Loading regions". */
        pendingText: string;
      }
  );

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
      className={fieldStyles().root({ className: styles.root({ className }) })}
    >
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            {label && (
              <Label className={parts.label()}>
                {label}
                {count !== undefined && (
                  <Count text={count} className={styles.count()} />
                )}
              </Label>
            )}
            <Button
              className={(renderProps) => selectTriggerStyles(renderProps)}
            >
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
                <Text slot='description' className={parts.description()}>
                  {description}
                </Text>
              )
            )}
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
            <Popover className={styles.popover()}>
              <ListBox items={items} className={styles.listBox()}>
                {children}
              </ListBox>
            </Popover>
          </>
        );
      }}
    </AriaSelect>
  );
};
