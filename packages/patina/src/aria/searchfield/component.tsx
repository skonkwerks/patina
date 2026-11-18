import { IconSearch, IconX } from '@tabler/icons-react';
import {
  Button as AriaButton,
  Group,
  Input,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import {
  fieldBoxStyles,
  fieldButtonStyles,
  fieldStyles,
} from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';

export const searchFieldStyles = tv({
  slots: {
    // `group` lets the clear control hide while the field is empty.
    root: 'group',
    icon: 'text-surface-foreground-muted h-4 w-4 shrink-0',
    input:
      'placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent outline-0 [&::-webkit-search-cancel-button]:hidden',
    clearIcon: 'h-3.5 w-3.5',
  },
});

/** The box around the icon, the text, and the clear control: the shared field box. */
export const searchFieldBoxStyles = tv({
  extend: fieldBoxStyles,
  base: 'flex h-8 items-center gap-2 px-2',
});

/** The clear control: the shared field button, hidden while the field is empty. */
export const searchFieldClearStyles = tv({
  extend: fieldButtonStyles,
  base: 'group-empty:invisible',
});

export type SearchFieldProps = Omit<
  AriaSearchFieldProps,
  'className' | 'onSubmit'
> &
  FieldHeaderProps & {
    /** What Enter does; by default nothing, so a search inside a form never submits the form. */
    onSubmit?: (value: string) => void;
    /** The visible label; a field in a toolbar may carry `aria-label` instead. */
    label?: string;
    /** An example value, never a label or an instruction. */
    placeholder?: string;
    className?: string;
  };

/**
 * A search box under the shared field header: a magnifying glass at the start, the text, and a
 * clear control once there is text. Escape clears it, as React Aria's search field does. The box
 * is React Aria's `Group`, so it shows the focus ring while the keyboard focus is inside it.
 */
export const SearchField = ({
  label,
  optionalText,
  info,
  description,
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
      className={fieldStyles().root({ className: styles.root({ className }) })}
    >
      {({ isDisabled, isInvalid }) => (
        <>
          <FieldHeader
            label={label}
            optionalText={optionalText}
            info={info}
            description={description}
            isDisabled={isDisabled}
          />
          <Group
            role='presentation'
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            className={(renderProps) => searchFieldBoxStyles(renderProps)}
          >
            <IconSearch aria-hidden className={styles.icon()} />
            <Input placeholder={placeholder} className={styles.input()} />
            {/* React Aria names the clear button ("Clear search") through the search field's context. */}
            <AriaButton
              className={(renderProps) => searchFieldClearStyles(renderProps)}
            >
              <IconX aria-hidden className={styles.clearIcon()} />
            </AriaButton>
          </Group>
        </>
      )}
    </AriaSearchField>
  );
};
