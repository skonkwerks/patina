import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Button } from '../../aria/button/index.ts';
import { Alert, type StatusTone } from './index.ts';

const meta = {
  title: 'Composites/Alert',
  component: Alert,
  args: {
    title: 'Storage is almost full',
    children: 'Uploads stop when the last 2 GB are used.',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Dismissing removes the notice and the focus lands on the control that stays; that control brings
 * the notice back and keeps the focus.
 */
const dismissThenShowAgain: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  const notice = canvas.getByRole('status');
  await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
  await waitFor(async () => {
    await expect(notice).not.toBeInTheDocument();
  });
  const showAgain = canvas.getByRole('button', {
    name: 'Show the notice again',
  });
  await expect(showAgain).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  await expect(
    await canvas.findByRole('button', { name: 'Dismiss' }),
  ).toBeVisible();
  await expect(showAgain).toHaveFocus();
};

export const Default: Story = {};

const tones: readonly StatusTone[] = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
];

/** Every tone side by side; a warning and a failure are announced as alerts, the rest as a status. */
export const Tones: Story = {
  render: () => (
    <div className='flex max-w-lg flex-col gap-3'>
      {tones.map((tone) => (
        <Alert key={tone} tone={tone} title={`A ${tone} notice`}>
          What happened, and what to do next.
        </Alert>
      ))}
    </div>
  ),
};

/** Words alone, with no title: the icon leads the line. */
export const WithoutTitle: Story = {
  args: { title: undefined, tone: 'neutral' },
};

/** A failure with its action: the notice a section shows when it could not be read. */
export const WithActions: Story = {
  args: {
    tone: 'error',
    title: undefined,
    children: 'The projects could not be read.',
    actions: <Button size='sm'>Retry</Button>,
  },
};

type DismissableAlertProps = { title?: string };

/**
 * Dismissing removes the close control that holds the focus, so the story moves the focus to the
 * control that stays, the one that shows the notice again.
 */
const DismissableAlert = ({ title }: DismissableAlertProps) => {
  const [isShown, setIsShown] = useState(true);
  const showAgain = useRef<HTMLButtonElement>(null);
  const wasDismissed = useRef(false);
  useEffect(() => {
    if (!isShown && wasDismissed.current) {
      showAgain.current?.focus();
    }
  }, [isShown]);
  return (
    <div className='flex max-w-lg flex-col items-start gap-3'>
      <Button
        ref={showAgain}
        size='sm'
        // A reason, not isDisabled: its own press shows the notice, and a disabled button would lose
        // the focus it holds. With a reason it stays focusable and says why it does nothing.
        disabledReason={isShown ? 'The notice is shown.' : undefined}
        onPress={() => setIsShown(true)}
      >
        Show the notice again
      </Button>
      {isShown && (
        <Alert
          tone='success'
          title={title}
          closeLabel='Dismiss'
          onDismiss={() => {
            wasDismissed.current = true;
            setIsShown(false);
          }}
        >
          People can now find you by name.
        </Alert>
      )}
    </div>
  );
};

/** With a round close control, named by `closeLabel`; dismissing moves the focus to what stays. */
export const Dismissable: Story = {
  render: () => <DismissableAlert title='Your profile is complete' />,
  play: dismissThenShowAgain,
};

/** Dismissable with no title: the words stay beside the icon, and the close control ends the row. */
export const DismissableWithoutTitle: Story = {
  render: () => <DismissableAlert />,
  play: dismissThenShowAgain,
};
