import {
  DateInput as AriaDateInput,
  type DateInputProps as AriaDateInputProps,
  DateSegment,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

/**
 * One segment of a date or time (the month, the hour, a separator). A segment holding the focus is
 * filled as a selection is, since it is what the keyboard edits; an empty one shows React Aria's
 * placeholder (`mm` for an English month, two dashes for a part of a time) in the placeholder
 * color. The digits are tabular, so a value keeps its width as it changes. The segment keeps its
 * own colors in forced colors (`forced-color-adjust-none`), so each is a system color there:
 * `FieldText`, `GrayText` for a placeholder, and the highlight colors for the focused segment.
 */
export const dateSegmentStyles = tv({
  base: 'inline rounded-sm px-0.5 tabular-nums caret-transparent outline-0 forced-color-adjust-none data-[type=literal]:px-0 forced-colors:text-[FieldText]',
  variants: {
    isPlaceholder: {
      true: 'text-input-placeholder forced-colors:text-[GrayText]',
      false: 'text-input-foreground',
    },
    // Last, so the fill's text color wins over the placeholder's.
    isFocused: {
      true: 'bg-primary text-primary-foreground forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
});

export type DateInputProps = Omit<AriaDateInputProps, 'children'>;

/**
 * The editable segments of a date or time, shared by `DateField`, `TimeField`, `DatePicker` and
 * `DateRangePicker`, so every date is typed and drawn the same way. The caller gives the box: a
 * field draws it on this element, a picker on the group around it and its calendar button. Not
 * exported from the package.
 */
export const DateInput = (props: DateInputProps) => (
  <AriaDateInput {...props}>
    {(segment) => (
      <DateSegment
        segment={segment}
        className={(renderProps) => dateSegmentStyles(renderProps)}
      />
    )}
  </AriaDateInput>
);
