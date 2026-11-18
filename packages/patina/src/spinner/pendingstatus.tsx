import { Spinner } from './component.js';
import { pendingStatusStyles } from './styles.js';

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
