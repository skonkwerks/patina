import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const progressBarStyles = tv({
  slots: {
    track: 'bg-surface-border h-2 overflow-hidden rounded-full',
    fill: 'bg-primary h-full rounded-full',
  },
  variants: {
    isIndeterminate: {
      true: { fill: 'w-1/3 animate-pulse motion-reduce:animate-none' },
      false: { fill: 'transition-[width]' },
    },
  },
});

export type ProgressBarProps = Omit<
  AriaProgressBarProps,
  'aria-label' | 'children'
> & {
  /** Required: the bar draws no visible label, so this is its whole accessible name. */
  'aria-label': string;
};

/** A thin progress bar in the primary color; indeterminate while `isIndeterminate`. */
export const ProgressBar = (props: ProgressBarProps) => (
  <AriaProgressBar {...props}>
    {({ percentage, isIndeterminate }) => {
      const styles = progressBarStyles({ isIndeterminate });
      return (
        <div className={styles.track()}>
          <div
            className={styles.fill()}
            style={
              isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }
            }
          />
        </div>
      );
    }}
  </AriaProgressBar>
);
