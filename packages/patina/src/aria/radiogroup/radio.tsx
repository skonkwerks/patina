import {
  RadioButton,
  RadioField,
  type RadioFieldProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { choiceControlStyles } from '../../internal/field.js';
import { focusRing } from '../../internal/focus.js';

/** A radio choice: the shared choice control with a round mark that shows a dot when chosen. */
export const radioStyles = tv({
  extend: choiceControlStyles,
  slots: {
    mark: 'border-control-border w-5 justify-center rounded-full border',
    dot: 'bg-primary group-selected:opacity-100 h-2.5 w-2.5 rounded-full opacity-0',
  },
});

export type RadioProps = Omit<RadioFieldProps, 'className' | 'children'> & {
  /** The choice's name. */
  children: string;
  /** What choosing it means, under its name. */
  description?: string;
  className?: string;
};

/** One choice of a `RadioGroup`: its mark, its name, and what choosing it means. */
export const Radio = ({
  children,
  description,
  className,
  ...rest
}: RadioProps) => (
  <RadioField {...rest} className={radioStyles().root({ className })}>
    {({ isDisabled }) => {
      const styles = radioStyles({ isDisabled });
      return (
        <>
          <RadioButton className={styles.button()}>
            {({ isFocusVisible }) => (
              <>
                <span
                  className={styles.mark({
                    className: focusRing({ isFocusVisible }),
                  })}
                >
                  <span className={styles.dot()} />
                </span>
                <span className={styles.label()}>{children}</span>
              </>
            )}
          </RadioButton>
          {description && (
            <Text slot='description' className={styles.description()}>
              {description}
            </Text>
          )}
        </>
      );
    }}
  </RadioField>
);
