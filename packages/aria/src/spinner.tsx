import { tv, type VariantProps } from 'tailwind-variants';

export const spinnerStyles = tv({
  base: 'shrink-0 animate-spin motion-reduce:animate-none',
  variants: {
    size: {
      /** 14px: inline with small text, or in a small button. */
      sm: 'size-3.5',
      /** 16px: beside a control's label, as a button's pending spinner. */
      md: 'size-4',
      /** 20px: in place of an icon, or standing alone in a section. */
      lg: 'size-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export type SpinnerProps = VariantProps<typeof spinnerStyles> & {
  /**
   * What is working, as the spinner's accessible name, when it stands on its own. Omitted, the
   * spinner is decoration beside text that already says so (a pending button's label) and is hidden
   * from assistive technology.
   */
  label?: string;
  /** Extra classes, such as `size-8` for a spinner that stands alone on a page. */
  className?: string;
};

/**
 * A spinner, wherever a surface says that work is in progress: a faint ring with a quarter arc
 * turning on it, in the color of the text it stands in. It stands still for a person who asked for
 * less motion.
 */
export const Spinner = ({ label, size, className }: SpinnerProps) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    className={spinnerStyles({ size, className })}
    // Named, it is an image; without a name, decoration hidden from assistive technology.
    role={label === undefined ? undefined : 'img'}
    aria-label={label}
    aria-hidden={label === undefined ? true : undefined}
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

export const pendingStatusStyles = tv({
  base: 'flex items-center gap-2 text-sm',
});

export type PendingStatusProps = {
  /** The words that say the surface is working, such as "Loading". */
  text: string;
  /** Layout and the text color of where it stands. */
  className?: string;
};

/**
 * What a surface shows while it waits for what it reads: the spinner, turning, and beside it the
 * words that say so, at the start of where the content will be.
 */
export const PendingStatus = ({ text, className }: PendingStatusProps) => (
  <p role='status' className={pendingStatusStyles({ className })}>
    <Spinner />
    {text}
  </p>
);
