import { IconChevronDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  Button,
  FieldError,
  ListBox,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Count } from '../../count/index.ts';
import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';
import { FieldPending, type FieldPendingProps } from '../form/pending.tsx';
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
> &
  FieldHeaderProps & {
    /** The visible label; a select in a toolbar may carry `aria-label` instead. */
    label?: string;
    /**
     * A muted count inside the label, after its text and before `optionalText`, so it is read with
     * the label; formatted by the caller from the vocabulary, such as "(4)".
     */
    count?: string;
    errorMessage?: string;
    items: Iterable<T>;
    children: (item: T) => ReactNode;
    className?: string;
  } & FieldPendingProps;

/**
 * A labeled single-choice dropdown under the shared field header: a trigger showing the chosen
 * option, its error under it, and a list in a popover. While the choices are read (`isPending`),
 * the spinner and `pendingText` stand where the description does, in a place that keeps one
 * height, so the trigger does not move when they come or go. The trigger shows the chosen
 * option's text (its `textValue`, or its children when they are plain text), never its other
 * content: an option with an icon shows its words alone there, and an option whose children are
 * not plain text and that has no `textValue` shows nothing there.
 */
export const Select = <T extends object>({
  label,
  count,
  optionalText,
  info,
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
            <FieldHeader
              label={label}
              count={
                count === undefined ? undefined : (
                  <Count text={count} className={styles.count()} />
                )
              }
              optionalText={optionalText}
              info={info}
              description={description}
              pendingDescription={
                pendingText === undefined ? undefined : (
                  <FieldPending pendingText={pendingText} />
                )
              }
              isPending={isPending}
              isDisabled={isDisabled}
            />
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
