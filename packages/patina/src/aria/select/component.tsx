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
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Count } from '../../count/index.ts';
import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import {
  FieldDescription,
  type FieldPendingProps,
} from '../form/description.tsx';
import { Popover } from '../popover/index.ts';

export const selectStyles = tv({
  slots: {
    // `group` lets the trigger draw the invalid border React Aria marks on the field.
    root: 'group',
    count: 'text-xs',
    value: 'placeholder-shown:text-input-placeholder truncate',
    chevron: 'h-4 w-4 shrink-0',
    popover: 'max-h-72 w-(--trigger-width) overflow-auto p-1',
    listBox: 'outline-0',
  },
});

/** The trigger: the shared field box, with the invalid border React Aria marks on the field. */
export const selectTriggerStyles = tv({
  extend: fieldBoxStyles,
  base: 'group-data-[invalid]:border-error flex h-8 items-center justify-between gap-2 px-3',
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
} & FieldPendingProps;

/**
 * A labeled single-choice dropdown: a trigger showing the chosen option and a list in a popover.
 * The trigger shows the chosen option's text (its `textValue`, or its children when they are plain
 * text), never its other content: an option with an icon shows its words alone there, and an
 * option whose children are not plain text and that has no `textValue` shows nothing there.
 */
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
              {/* The chosen option's text, as a combo box's input shows it: the option's own content
                also holds the check mark the list draws. With nothing chosen, React Aria shows the
                `placeholder` prop, or its own "Select an item". */}
              <SelectValue className={styles.value()}>
                {({ isPlaceholder, defaultChildren, selectedText }) =>
                  isPlaceholder ? defaultChildren : selectedText
                }
              </SelectValue>
              <IconChevronDown className={styles.chevron()} aria-hidden />
            </Button>
            <FieldDescription
              description={description}
              isPending={isPending}
              pendingText={pendingText}
            />
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
