import type { VariantProps } from 'tailwind-variants';

import { spinnerStyles } from './styles.js';

export type SpinnerProps = VariantProps<typeof spinnerStyles> & {
  /**
   * What is working, as the spinner's accessible name, when it stands on its own. Omitted, the
   * spinner is decoration beside text that already says so (a pending button's label) and is hidden
   * from assistive technology.
   */
  'aria-label'?: string;
  /** Extra classes, such as `size-8` for a spinner that stands alone on a page. */
  className?: string;
};

/**
 * A spinner, wherever a surface says that work is in progress: a faint ring with a quarter arc
 * turning on it, in the color of the text it stands in. It stands still for a person who asked for
 * less motion.
 */
export const Spinner = ({
  'aria-label': ariaLabel,
  size,
  className,
}: SpinnerProps) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={spinnerStyles({ size, className })}
    // Named, it is an image; without a name, decoration hidden from assistive technology.
    role={ariaLabel === undefined ? undefined : 'img'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel === undefined ? true : undefined}
  >
    <circle
      cx='12'
      cy='12'
      r='9'
      stroke='currentColor'
      strokeOpacity='0.25'
      strokeWidth='3'
    />
    <path
      d='M21 12a9 9 0 0 0 -9 -9'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
    />
  </svg>
);
