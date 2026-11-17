import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Chip } from '../../chip/index.ts';
import { StateDetails } from './index.ts';

const meta = {
  title: 'Composites/StateDetails',
  component: StateDetails,
  args: {
    'aria-label': 'Why it failed',
    tone: 'error',
    children:
      'The upload stopped at 62%: the connection closed before the server answered. Try again on a steadier connection.',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StateDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the icon to read the details; Escape or a press outside closes them. */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const control = canvas.getByRole('button', { name: 'Why it failed' });

    // The keyboard reaches the icon, whose name shows as its tooltip.
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'Why it failed',
    );

    // Enter opens the words, and the dialog takes the focus (its ring is CSS `:focus-visible`, which
    // only trusted keyboard input sets, so it is checked by eye, not here); Escape closes them and
    // the focus returns to the icon.
    await userEvent.keyboard('{Enter}');
    const dialog = await page.findByRole('dialog', { name: 'Why it failed' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(control).toHaveFocus();

    // A press opens them and the dialog takes the focus; a press outside closes them, with the
    // focus back on the icon.
    await userEvent.click(control);
    const pointerDialog = await page.findByRole('dialog', {
      name: 'Why it failed',
    });
    await expect(pointerDialog).toHaveFocus();
    await userEvent.click(canvasElement.ownerDocument.body);
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(control).toHaveFocus();
  },
};

export const Warning: Story = {
  args: {
    'aria-label': 'What needs attention',
    tone: 'warning',
    children:
      'Two of the files are larger than the preview limit and show no thumbnail.',
  },
};

export const Info: Story = {
  args: {
    'aria-label': 'Details',
    tone: 'info',
    children: 'Queued behind 3 other uploads.',
  },
};

/** Beside the chip that shows the state, as a row shows it. */
export const BesideAChip: Story = {
  render: (args) => (
    <div className='flex items-center gap-1'>
      <Chip tone='error'>Failed</Chip>
      <StateDetails {...args} />
    </div>
  ),
};
