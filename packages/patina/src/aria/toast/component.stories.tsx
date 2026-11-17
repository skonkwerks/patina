import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/index.ts';
import { showToast, ToastRegion } from './index.ts';

const meta = {
  title: 'Aria/Toast',
  component: ToastRegion,
  args: {},
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press a button to add a toast; each dismisses itself after a few seconds, and at most three show. */
export const Default: Story = {
  render: (args) => (
    <>
      <div className='flex flex-wrap gap-3'>
        <Button
          onPress={() => showToast({ title: 'Project saved', tone: 'success' })}
        >
          Show success
        </Button>
        <Button
          onPress={() =>
            showToast({
              title: 'Export started',
              description: 'You will get an email when the file is ready.',
              tone: 'info',
            })
          }
        >
          Show info
        </Button>
        <Button
          onPress={() => {
            for (const n of [1, 2, 3, 4]) {
              showToast({ title: `Upload ${n} finished`, tone: 'success' });
            }
          }}
        >
          Show four
        </Button>
      </div>
      <ToastRegion {...args} />
    </>
  ),
};

/** The region moved through `className`, as an app with a side panel at the right would. */
export const BesideAPanel: Story = {
  ...Default,
  args: { className: 'right-80' },
};
