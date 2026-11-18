import { Button } from '../../aria/button/index.js';
import { Alert } from '../alert/index.js';

export type LoadFailureProps = {
  /** Why the read failed, in words. */
  message: string;
  /** The retry control's label, such as "Retry". */
  retryLabel: string;
  /** Reads again. */
  onRetry: () => void;
  /**
   * The read is running again: Retry shows its spinner, keeps the focus, and ignores a second
   * press. Keep the failure on screen while it runs; never swap it for a working status.
   */
  isRetrying?: boolean;
};

/**
 * A failed read with the way to read again: the one notice for a page, a section, or a list that
 * could not be read, and for a failed refresh above what stays on screen. A list's `error` takes it.
 * A read that succeeds removes the notice and its Retry, so when Retry held the focus the caller
 * moves the focus to the content's heading.
 */
export const LoadFailure = ({
  message,
  retryLabel,
  onRetry,
  isRetrying = false,
}: LoadFailureProps) => (
  <Alert
    tone='error'
    actions={
      <Button size='sm' isPending={isRetrying} onPress={onRetry}>
        {retryLabel}
      </Button>
    }
  >
    {message}
  </Alert>
);
