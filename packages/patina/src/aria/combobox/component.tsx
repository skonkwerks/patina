import { IconChevronDown } from '@tabler/icons-react';
import { type ReactNode, useRef } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
  FieldError,
  Group,
  Input,
  Label,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import {
  fieldBoxStyles,
  fieldButtonStyles,
  fieldStyles,
} from '../../internal/field.ts';
import {
  FieldDescription,
  type FieldPendingProps,
} from '../form/description.tsx';
import { Popover } from '../popover/index.ts';
import List from './list.tsx';
import ShownError from './shownerror.tsx';

export const comboBoxStyles = tv({
  slots: {
    input:
      'placeholder:text-input-placeholder h-full min-w-0 flex-1 bg-transparent outline-0',
    chevron: 'h-4 w-4',
    // In multiple selection, the chosen options under the field. It keeps one line's room while
    // nothing is chosen, so the first choice moves nothing below it.
    value:
      'text-surface-foreground data-[placeholder]:text-surface-foreground-muted min-h-4 text-xs',
    popover: 'flex w-(--trigger-width) flex-col overflow-hidden',
    // The list scrolls, not the popover: the input keeps the focus while the arrow keys move a
    // virtual focus through the options, and React Aria scrolls that option into view inside the
    // list.
    listBox: 'max-h-72 min-h-0 flex-1 overflow-auto p-1 outline-0',
  },
});

/** The box around the input and the chevron: the shared field box, one line tall. */
export const comboBoxFieldStyles = tv({
  extend: fieldBoxStyles,
  base: 'flex h-8 items-center gap-1 pr-1 pl-3',
});

/** The chevron that opens the list: the shared field button, a little larger. */
export const comboBoxButtonStyles = tv({
  extend: fieldButtonStyles,
  base: 'h-6 w-6',
});

/**
 * The choice is given and taken as `value` and `onChange`, as React Aria's ComboBox documents it;
 * the older `selectedKey` props it still accepts and marks deprecated are not part of the wrapper.
 * The list always stays open while the typed text matches nothing, and says so (`noMatchesLabel`),
 * so React Aria's `allowsEmptyCollection` is the wrapper's.
 */
export type ComboBoxProps<
  T extends object,
  M extends 'single' | 'multiple' = 'single',
> = Omit<
  AriaComboBoxProps<T, M>,
  | 'className'
  | 'children'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
  | 'allowsEmptyCollection'
> & {
  /** The visible label; a combo box in a toolbar may carry `aria-label` instead. */
  label?: string;
  description?: string;
  /** The error to show under the field; also marks the field invalid. */
  errorMessage?: string;
  /** An example value, never a label or an instruction. */
  placeholder?: string;
  /**
   * What the list says when the typed text matches no option, such as "No regions match", so a
   * search that finds nothing is told apart from a field that stopped working.
   */
  noMatchesLabel: string;
  /** In multiple selection, what the line of chosen options says while none is chosen, such as "No regions chosen". */
  valuePlaceholder?: string;
  /** The options: `ListBoxItem`s and `ListBoxSection`s, or a function that renders one for each of `items` or `defaultItems`. */
  children: ReactNode | ((item: T) => ReactNode);
  className?: string;
} & FieldPendingProps;

/**
 * A labeled text input that filters a list of options as the person types: the input with a
 * chevron that opens the whole list, and the list in a popover as wide as the field. React Aria
 * filters `defaultItems` and static options by the typed text; a caller that passes `items` filters
 * them itself. With `selectionMode='multiple'` the list stays open while options are chosen, and
 * the chosen ones are listed under the field. The options are the shared `ListBoxItem`, so they
 * look as a `Select`'s do. While the options are read (`isPending`, such as a search on a server),
 * the spinner and `pendingText` stand where the description does, and an empty list says
 * `pendingText` rather than that nothing matches.
 */
export const ComboBox = <
  T extends object,
  M extends 'single' | 'multiple' = 'single',
>({
  label,
  description,
  isPending = false,
  pendingText,
  errorMessage,
  placeholder,
  noMatchesLabel,
  valuePlaceholder,
  children,
  className,
  ...rest
}: ComboBoxProps<T, M>) => {
  const field = useRef<HTMLDivElement>(null);
  const styles = comboBoxStyles();
  return (
    <AriaComboBox
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and `isRequired`, so it is set only
      // for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      allowsEmptyCollection
      className={fieldStyles().root({ className })}
    >
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            <ShownError field={field} />
            {label && <Label className={parts.label()}>{label}</Label>}
            <Group
              className={(renderProps) => comboBoxFieldStyles(renderProps)}
            >
              <Input placeholder={placeholder} className={styles.input()} />
              {/* React Aria names the chevron ("Show suggestions") and keeps it out of the Tab order. */}
              <AriaButton
                className={(renderProps) => comboBoxButtonStyles(renderProps)}
              >
                <IconChevronDown aria-hidden className={styles.chevron()} />
              </AriaButton>
            </Group>
            {rest.selectionMode === 'multiple' && (
              <ComboBoxValue
                placeholder={valuePlaceholder}
                className={styles.value()}
              />
            )}
            <FieldDescription
              description={description}
              isPending={isPending}
              pendingText={pendingText}
            />
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
            <Popover className={styles.popover()}>
              <List
                className={styles.listBox()}
                noMatchesLabel={noMatchesLabel}
                pendingText={isPending ? pendingText : undefined}
              >
                {children}
              </List>
            </Popover>
          </>
        );
      }}
    </AriaComboBox>
  );
};
