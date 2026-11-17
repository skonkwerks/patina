import {
  SwitchButton,
  SwitchField,
  type SwitchFieldProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { choiceControlStyles } from './field.ts';
import { focusRing } from './focus.ts';
import { Spinner } from './spinner.tsx';

/** A switch: the shared choice control with a track for its mark, and a thumb that slides when on. */
export const switchStyles = tv({
  extend: choiceControlStyles,
  slots: {
    // Declared so the variants below can name them; their classes come from the choice control.
    button: '',
    description: '',
    mark: 'bg-neutral group-selected:bg-primary w-9 rounded-full px-0.5 transition-colors',
    thumb:
      'bg-surface group-selected:translate-x-4 flex h-4 w-4 items-center justify-center rounded-full shadow transition-transform',
    spinner: 'text-surface-foreground-muted',
  },
  variants: {
    // While its write is on its way, the switch is busy, not disabled: it keeps its full look.
    isPending: { true: { button: 'cursor-progress' } },
    // Pending words stand in for a description the switch does not show: said, but not seen, so the
    // switch keeps its height in a row.
    isDescriptionHidden: { true: { description: 'sr-only' } },
  },
});

export type SwitchProps = Omit<SwitchFieldProps, 'className' | 'children'> & {
  /** The visible label. It names what is on and never changes with the state. */
  children: string;
  description?: string;
  className?: string;
} & (
    | { isPending?: false; pendingText?: undefined }
    | {
        /**
         * The write the switch started is on its way. The switch shows the spinner in its thumb and
         * is read-only meanwhile (React Aria's `isReadOnly`): presses do nothing, while it keeps the
         * focus and shows what is stored. It moves when the write is answered and the caller passes
         * the stored value.
         */
        isPending: boolean;
        /**
         * What the switch says while `isPending`, such as "Saving": it stands where the description
         * does, as the switch's description, so assistive technology hears it with the switch.
         */
        pendingText: string;
      }
  );

/**
 * A labeled on/off switch with token styling and the shared focus ring on the track, in React
 * Aria's anatomy: a field, the button that is its label, and its description as the field's own
 * slot. A switch is for something that takes effect the moment it is pressed; a yes or no that
 * waits for a form's Save is a `Checkbox`.
 */
export const Switch = ({
  children,
  description,
  isPending = false,
  pendingText,
  className,
  ...rest
}: SwitchProps) => (
  <SwitchField
    {...rest}
    isReadOnly={isPending || rest.isReadOnly}
    className={switchStyles().root({ className })}
  >
    {({ isDisabled }) => {
      const styles = switchStyles({ isDisabled, isPending });
      return (
        <>
          <SwitchButton className={styles.button()}>
            {({ isFocusVisible }) => (
              <>
                <span
                  className={styles.mark({
                    className: focusRing({ isFocusVisible }),
                  })}
                >
                  <span className={styles.thumb()}>
                    {isPending && (
                      <Spinner size='sm' className={styles.spinner()} />
                    )}
                  </span>
                </span>
                <span className={styles.label()}>{children}</span>
              </>
            )}
          </SwitchButton>
          {/* While pending, the words that say so are the switch's description, in place of its own:
              shown where it has one, and only said where it has none, so the switch keeps its height. */}
          {isPending ? (
            <Text
              slot='description'
              className={styles.description({
                isDescriptionHidden: !description,
              })}
            >
              {pendingText}
            </Text>
          ) : (
            description && (
              <Text slot='description' className={styles.description()}>
                {description}
              </Text>
            )
          )}
        </>
      );
    }}
  </SwitchField>
);
