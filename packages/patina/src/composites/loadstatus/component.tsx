import { PendingStatus } from '../../spinner/index.js';
import { LoadFailure, type LoadFailureProps } from './failure.js';

export type LoadStatusProps = {
  /**
   * The failed read, kept while it is read again (with its `isRetrying`), or nothing while the first
   * read is still on its way.
   */
  failure: LoadFailureProps | undefined;
  /** What to say while the first read is on its way, such as "Loading projects". */
  pendingText: string;
};

/**
 * What stands in a page's or a section's body until its read answers: that the first read is
 * working, with the spinner and the words, or how it failed, with Retry. A retry keeps the failure
 * and shows Retry pending, so the focused Retry is never removed by its own press. A read that
 * succeeds replaces this with the content, so when Retry held the focus the caller moves it to the
 * content's heading. It never stands for an empty result, which is the caller's `EmptyState`, and it
 * takes the text color of where it stands.
 */
export const LoadStatus = ({ failure, pendingText }: LoadStatusProps) =>
  failure ? <LoadFailure {...failure} /> : <PendingStatus text={pendingText} />;
