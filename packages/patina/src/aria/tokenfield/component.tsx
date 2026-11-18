import type { Ref } from 'react';
import {
  TokenField as AriaTokenField,
  type TokenFieldProps as AriaTokenFieldProps,
  type TokenFieldValue,
  TokenInput,
  type TokenInputProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldBoxStyles, fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';

/**
 * The editable area: the shared field box, one line tall, or a few lines while it takes line
 * breaks. While it is empty it shows its placeholder. The CSS `:empty` is written out, because the
 * React Aria Tailwind plugin's `empty:` reads a `data-empty` the token input does not set.
 */
export const tokenInputStyles = tv({
  extend: fieldBoxStyles,
  base: '[&:empty]:before:text-input-placeholder min-h-8 cursor-text px-3 py-1.5 leading-5 break-words whitespace-pre-wrap [&:empty]:before:content-[attr(data-placeholder)]',
  variants: {
    allowsNewlines: { true: 'min-h-24' },
  },
});

export type TokenFieldProps<V extends TokenFieldValue = TokenFieldValue> = Omit<
  AriaTokenFieldProps<V>,
  'className' | 'children'
> &
  FieldHeaderProps & {
    /** The visible label; a field without one carries `aria-label`. */
    label?: string;
    /** An example value, never a label or an instruction. */
    placeholder?: string;
    /** Renders each token of the value, usually as a `Token` holding the segment's text. */
    children: TokenInputProps<V>['children'];
    /** React 19 ref prop: the editable area, such as for a popover of suggestions anchored to it. */
    inputRef?: Ref<HTMLDivElement>;
    className?: string;
  };

/**
 * A labeled text field under the shared field header whose value holds tokens inline with the
 * text, such as mentions, hashtags, or a list of tags. The value is a `TokenFieldValue`, which this
 * subpath re-exports with its segment types; a subclass that overrides `tokenize` decides which
 * typed text becomes a token. A token is removed with Backspace or Delete like a character.
 *
 * Alpha: React Aria marks TokenField as alpha, and its API has changed in a minor release (1.21.0
 * replaced the value's `caretPosition` with `selectedRange`). Until React Aria marks it stable, this
 * subpath, the component and the value an app builds alike, may change with any React Aria minor
 * version that Patina's peer range allows. An app takes the value and its types from this subpath,
 * so a change reaches it through Patina's changelog. It has no validation and no form value of its
 * own yet, so the wrapper takes no `errorMessage`.
 */
export const TokenField = <V extends TokenFieldValue = TokenFieldValue>({
  label,
  optionalText,
  info,
  description,
  placeholder,
  inputRef,
  children,
  className,
  ...rest
}: TokenFieldProps<V>) => (
  <AriaTokenField {...rest} className={fieldStyles().root({ className })}>
    {({ isDisabled }) => (
      <>
        <FieldHeader
          label={label}
          optionalText={optionalText}
          info={info}
          description={description}
          isDisabled={isDisabled}
        />
        <TokenInput<V>
          ref={inputRef}
          data-placeholder={placeholder}
          // A text field shows the focus ring whenever it holds the focus, by pointer too, as the
          // text input wrappers do.
          className={({ isFocused, isDisabled: isInputDisabled }) =>
            tokenInputStyles({
              isFocusVisible: isFocused,
              isDisabled: isInputDisabled,
              allowsNewlines: rest.allowsNewlines ?? false,
            })
          }
        >
          {children}
        </TokenInput>
      </>
    )}
  </AriaTokenField>
);
