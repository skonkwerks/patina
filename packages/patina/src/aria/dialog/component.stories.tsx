import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.ts';
import { Button } from '../button/index.ts';
import { IconButton } from '../iconbutton/index.ts';
import { TextField } from '../textfield/index.ts';
import {
  Dialog,
  DialogCancel,
  DialogModal,
  type DialogProps,
  DialogTrigger,
} from './index.ts';

const meta = {
  title: 'Aria/Dialog',
  component: Dialog,
  args: {
    title: 'Rename project',
    closeLabel: 'Close',
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const Body = () => (
  <p className='text-overlay-foreground-muted text-sm'>
    The new name shows everywhere the project is listed. Links to the project
    keep working.
  </p>
);

/** A trigger button, and the dialog it opens in a modal. */
const OpenDialog = ({
  isDismissable = true,
  ...args
}: DialogProps & { isDismissable?: boolean }) => (
  <DialogTrigger>
    <Button variant='solid' tone='primary'>
      Open dialog
    </Button>
    <DialogModal isDismissable={isDismissable}>
      <Dialog {...args}>
        <Body />
        <div className='flex justify-end gap-2'>
          <DialogCancel>Cancel</DialogCancel>
          <Button variant='solid' tone='primary' slot='close'>
            Rename
          </Button>
        </div>
      </Dialog>
    </DialogModal>
  </DialogTrigger>
);

export const Default: Story = {
  render: (args) => <OpenDialog {...args} />,
};

export const WithDescription: Story = {
  args: { description: 'Started 3 days ago · Marketing' },
  render: (args) => <OpenDialog {...args} />,
};

/** Header extras: something between the title and the close control, and an action beside it. */
export const WithHeaderContent: Story = {
  args: {
    title: 'Photo',
    headerContent: (
      <span className='text-overlay-foreground-muted self-center text-sm'>
        3 of 12
      </span>
    ),
    headerActions: (
      <IconButton aria-label='Details' size='sm'>
        <IconInfoCircle aria-hidden className='h-4 w-4' />
      </IconButton>
    ),
  },
  render: (args) => <OpenDialog {...args} />,
};

/** Not dismissable: Escape and a press on the scrim do nothing; only the close control or Cancel closes it. */
export const NotDismissable: Story = {
  render: (args) => <OpenDialog {...args} isDismissable={false} />,
};

/** A dialog whose Rename runs for two seconds, during which nothing dismisses it. */
const PendingDialog = (args: DialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  return (
    <DialogTrigger>
      <Button variant='solid' tone='primary'>
        Open dialog
      </Button>
      <DialogModal isDismissDisabled={isSaving}>
        <Dialog {...args}>
          <Body />
          <div className='flex justify-end gap-2'>
            <DialogCancel>Cancel</DialogCancel>
            <Button
              variant='solid'
              tone='primary'
              isPending={isSaving}
              onPress={() => {
                setIsSaving(true);
                setTimeout(() => setIsSaving(false), 2000);
              }}
            >
              Rename
            </Button>
          </div>
        </Dialog>
      </DialogModal>
    </DialogTrigger>
  );
};

/** While a save is pending nothing dismisses the dialog: not Escape, the scrim, the close control or Cancel. */
export const DismissDisabledWhilePending: Story = {
  render: (args) => <PendingDialog {...args} />,
};

const properties = [
  'Name',
  'Owner',
  'Client',
  'Budget',
  'Start date',
  'End date',
  'Region',
  'Channel',
  'Audience',
  'Goal',
  'Review lead',
  'Notes',
];

/**
 * The modal drawer: the window's full height at the right edge, for a set of fields about one
 * thing. Its title and close control stay at the top while its body scrolls.
 */
export const ModalDrawer: Story = {
  args: { title: 'Project properties' },
  render: (args) => (
    <DialogTrigger>
      <Button variant='solid' tone='primary'>
        Edit properties
      </Button>
      <DialogModal placement='right'>
        <Dialog {...args}>
          {properties.map((property) => (
            <TextField key={property} label={property} />
          ))}
          <div className='flex justify-end gap-2'>
            <DialogCancel>Cancel</DialogCancel>
            <Button variant='solid' tone='primary' slot='close'>
              Save
            </Button>
          </div>
        </Dialog>
      </DialogModal>
    </DialogTrigger>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit properties' }),
    );
    const dialog = await page.findByRole('dialog', {
      name: 'Project properties',
    });
    const close = within(dialog).getByRole('button', { name: 'Close' });
    // Scrolled to its last field, the drawer still shows its title and close control.
    within(dialog).getByRole('textbox', { name: 'Notes' }).scrollIntoView();
    await waitFor(() =>
      expect(close.getBoundingClientRect().top).toBeGreaterThanOrEqual(0),
    );
    await userEvent.click(close);
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    // React Aria announced the dialog by its title, now gone (see `LIVE_ANNOUNCER_MESSAGE`).
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
