import { useRef } from 'react';
import {
  ColorField as AriaColorField,
  ColorFieldContext,
  type ColorFieldProps as AriaColorFieldProps,
  FieldError,
  Input,
  useSlottedContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { fieldStyles } from '../../internal/field.js';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.js';
import { useShownErrorFollowsValue } from '../../internal/shownerror.js';
import { textFieldInputStyles } from '../textfield/index.js';

/** The input: `TextField`'s look, one line of the shared field box, extended here for the color field alone. */
export const colorFieldInputStyles = tv({ extend: textFieldInputStyles });

export type ColorFieldProps = Omit<AriaColorFieldProps, 'className'> &
  FieldHeaderProps & {
    /**
     * The visible label. Without one, a field that edits one `channel` is named by React Aria's
     * localized name of the channel; a hex field needs a label or an `aria-label`.
     */
    label?: string;
    /** The error to show under the field; also marks the field invalid. */
    errorMessage?: string;
    /** An example value, never a label or an instruction. */
    placeholder?: string;
    className?: string;
  };

/**
 * A color typed as text: a hex value by default, or the number of one `channel` in `colorSpace`.
 * It looks like `TextField`. React Aria parses the text when the field commits (on Enter or when it
 * is left) and puts back the last valid color when the text cannot be read; the arrow keys step the
 * value, and Page Up and Page Down take larger steps.
 */
export const ColorField = ({
  label,
  optionalText,
  info,
  description,
  errorMessage,
  placeholder,
  className,
  ...rest
}: ColorFieldProps) => {
  const field = useRef<HTMLDivElement>(null);
  // Inside a `ColorPicker` the field takes its value from the picker's context, not from `value`,
  // and the picker's other controls (an area, a swatch) set it: the shown error follows that value
  // too, so it clears once another control has fixed the color.
  const fromPicker = useSlottedContext(ColorFieldContext, rest.slot);
  useShownErrorFollowsValue(field, rest.value ?? fromPicker?.value);
  return (
    <AriaColorField
      ref={field}
      {...rest}
      // An explicit isInvalid makes React Aria skip `validate` and native constraints, so it is set
      // only for a caller's error.
      isInvalid={errorMessage === undefined ? rest.isInvalid : true}
      className={fieldStyles().root({ className })}
    >
      {({ isDisabled }) => {
        const parts = fieldStyles({ isDisabled });
        return (
          <>
            <FieldHeader
              label={label}
              optionalText={optionalText}
              info={info}
              description={description}
              isDisabled={isDisabled}
            />
            <Input
              placeholder={placeholder}
              className={(renderProps) => colorFieldInputStyles(renderProps)}
            />
            <FieldError className={parts.error()}>{errorMessage}</FieldError>
          </>
        );
      }}
    </AriaColorField>
  );
};
