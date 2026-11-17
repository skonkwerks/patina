import {
  SwitchButton,
  SwitchField,
  type SwitchFieldProps,
  Text,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const switchStyles = tv({
  slots: {
    root: 'flex flex-col',
    // Positioned, so the hidden input React Aria puts inside the label stays over it.
    button: 'group relative flex items-start gap-3 text-sm',
    track: [
      'bg-neutral group-selected:bg-primary mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors',
      'group-focus-visible:outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2',
      'group-disabled:opacity-50',
    ],
    thumb:
      'bg-surface group-selected:translate-x-4 h-4 w-4 rounded-full shadow transition-transform',
    label: 'text-surface-foreground font-medium',
    // Indented to stand under the label: the track's width and the gap after it.
    description: 'text-surface-foreground-muted ms-12 text-xs',
  },
});

export type SwitchProps = Omit<SwitchFieldProps, 'className' | 'children'> & {
  /** The visible label. */
  children: string;
  description?: string;
  className?: string;
};

/**
 * A labeled on/off switch with token styling and the shared focus ring on the track, in React
 * Aria's anatomy: a field, the button that is its label, and its description as the field's own
 * slot. A switch is for something that takes effect the moment it is pressed; a yes or no that
 * waits for a form's Save is a `Checkbox`.
 */
export const Switch = ({
  children,
  description,
  className,
  ...rest
}: SwitchProps) => {
  const styles = switchStyles();
  return (
    <SwitchField {...rest} className={styles.root({ className })}>
      <SwitchButton className={styles.button()}>
        <span className={styles.track()}>
          <span className={styles.thumb()} />
        </span>
        <span className={styles.label()}>{children}</span>
      </SwitchButton>
      {description && (
        <Text slot='description' className={styles.description()}>
          {description}
        </Text>
      )}
    </SwitchField>
  );
};
