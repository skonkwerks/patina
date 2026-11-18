import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.js';
import { LoadFailure, LoadStatus } from './index.js';

const meta = {
  title: 'Composites/LoadStatus',
  component: LoadStatus,
  args: { failure: undefined, pendingText: 'Loading projects' },
} satisfies Meta<typeof LoadStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first read is on its way: the spinner and the words, where the content will be. */
export const Reading: Story = {};

/** The read failed: the failure with Retry, in place of the content. */
export const Failed: Story = {
  args: {
    failure: {
      message: 'The projects could not be read.',
      retryLabel: 'Retry',
      onRetry: () => undefined,
    },
  },
};

/** The read is running again: the failure stays, and Retry shows its spinner and keeps the focus. */
export const Retrying: Story = {
  args: {
    failure: {
      message: 'The projects could not be read.',
      retryLabel: 'Retry',
      onRetry: () => undefined,
      isRetrying: true,
    },
  },
};

/** How long the story's pretend read takes. */
const READ_MS = 1_500;

type Phase = 'failed' | 'retrying' | 'read';

/** What the story's status line says after a number of reads started by Retry. */
const readsText = (reads: number) => {
  if (reads === 0) {
    return 'Not read again yet';
  }
  return reads === 1 ? 'Read again once' : `Read again ${String(reads)} times`;
};

/**
 * A section whose read failed: Retry reads again with the failure kept on screen, and a read that
 * succeeds moves the focus to the section's heading, since the Retry that held it is gone.
 */
const ProjectsSection = () => {
  const [phase, setPhase] = useState<Phase>('failed');
  const [reads, setReads] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const retried = useRef(false);
  useEffect(() => {
    // Only a read that a Retry started moves the focus, and only when the Retry that held it is
    // gone, so the focus is nowhere; a person who moved on during the read keeps their place.
    const focusIsLost =
      document.activeElement === null ||
      document.activeElement === document.body;
    if (phase === 'read' && retried.current && focusIsLost) {
      heading.current?.focus();
    }
  }, [phase]);
  const retry = () => {
    retried.current = true;
    setReads((n) => n + 1);
    setPhase('retrying');
    setTimeout(() => {
      setPhase('read');
    }, READ_MS);
  };
  return (
    <section className='flex max-w-md flex-col gap-3'>
      <h2 ref={heading} tabIndex={-1} className='text-lg font-semibold'>
        Projects
      </h2>
      <p role='status' className='text-canvas-foreground-muted text-xs'>
        {readsText(reads)}
      </p>
      {phase === 'read' ? (
        <p className='text-sm'>3 projects</p>
      ) : (
        <LoadStatus
          pendingText='Loading projects'
          failure={{
            message: 'The projects could not be read.',
            retryLabel: 'Retry',
            onRetry: retry,
            isRetrying: phase === 'retrying',
          }}
        />
      )}
    </section>
  );
};

/** Press Retry: it stays focused while the read runs, then the focus moves to the heading. */
export const RetryThenSuccess: Story = {
  render: () => <ProjectsSection />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const retry = canvas.getByRole('button', { name: 'Retry' });
    await userEvent.tab();
    await expect(retry).toHaveFocus();

    // Retry is pending at once, keeps the focus, and a second press changes nothing.
    await userEvent.keyboard('{Enter}');
    await expect(retry).toHaveAttribute('data-pending', 'true');
    await expect(retry).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Read again once',
    );
    await userEvent.keyboard('{Enter}');
    await expect(retry).toHaveAttribute('data-pending', 'true');
    await expect(retry).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Read again once',
    );

    // The read succeeds: the content replaces the failure, and the focus moves to the heading.
    const heading = canvas.getByRole('heading', { name: 'Projects' });
    await waitFor(
      async () => {
        await expect(heading).toHaveFocus();
      },
      { timeout: READ_MS * 3 },
    );
    await expect(canvas.getByText('3 projects')).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Read again once',
    );
    await expect(
      canvas.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();

    // React Aria announced the pending Retry, now gone (see `LIVE_ANNOUNCER_MESSAGE`).
    await waitFor(
      async () => {
        await expect(
          canvasElement.ownerDocument.querySelector(LIVE_ANNOUNCER_MESSAGE),
        ).toBeNull();
      },
      { timeout: LIVE_ANNOUNCER_CLEAR_MS },
    );
  },
};

/** The failure on its own, as a list's `error` or above data kept after a failed refresh. */
export const FailureAlone: Story = {
  render: () => (
    <LoadFailure
      message='The list could not be refreshed. It shows what was last read.'
      retryLabel='Retry'
      onRetry={() => undefined}
    />
  ),
};
