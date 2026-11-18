import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-react';
import { Dialog as AriaDialog } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.ts';
import { Button } from '../button/index.ts';
import { Dialog, DialogModal, DialogTrigger } from '../dialog/index.ts';
import { Popover } from '../popover/index.ts';
import { Separator } from '../separator/index.ts';
import { IconToggle, Toggle, ToggleGroup } from '../togglegroup/index.ts';
import { Toolbar, ToolbarGroup, type ToolbarProps } from './index.ts';

const meta = {
  title: 'Aria/Toolbar',
  component: Toolbar,
  args: { 'aria-label': 'Text formatting' },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const icon = 'size-4';

/**
 * A formatting toolbar: a group of independent toggles, a toggle group that is one choice, and a
 * group of buttons, set apart by separators.
 */
const Formatting = (args: ToolbarProps) => (
  <Toolbar {...args}>
    <ToolbarGroup aria-label='Style'>
      <IconToggle variant='outline' aria-label='Bold'>
        {() => <IconBold aria-hidden className={icon} />}
      </IconToggle>
      <IconToggle variant='outline' aria-label='Italic'>
        {() => <IconItalic aria-hidden className={icon} />}
      </IconToggle>
      <IconToggle variant='outline' aria-label='Underline'>
        {() => <IconUnderline aria-hidden className={icon} />}
      </IconToggle>
    </ToolbarGroup>
    <Separator />
    <ToggleGroup aria-label='Alignment' defaultSelectedKeys={['left']}>
      <IconToggle id='left' aria-label='Align left'>
        {() => <IconAlignLeft aria-hidden className={icon} />}
      </IconToggle>
      <IconToggle id='center' aria-label='Align center'>
        {() => <IconAlignCenter aria-hidden className={icon} />}
      </IconToggle>
      <IconToggle id='right' aria-label='Align right'>
        {() => <IconAlignRight aria-hidden className={icon} />}
      </IconToggle>
    </ToggleGroup>
    <Separator />
    <ToolbarGroup aria-label='Clipboard'>
      <Button>Copy</Button>
      <Button>Cut</Button>
      <Button disabledReason='Copy or cut something first.'>Paste</Button>
    </ToolbarGroup>
  </Toolbar>
);

/**
 * A row. Tab enters at the first control; Left and Right step through every control, across the
 * groups and over the separators, which run across the row. Up and Down do nothing here. Paste says
 * why it cannot be pressed and stays in the arrow keys' path.
 */
export const Horizontal: Story = {
  render: (args) => <Formatting {...args} />,
  play: async ({ canvas, userEvent }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Text formatting' });
    await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    for (const separator of canvas.getAllByRole('separator')) {
      await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
      await expect(separator.getBoundingClientRect().height).toBeGreaterThan(
        20,
      );
    }

    const bold = canvas.getByRole('button', { name: 'Bold' });
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(bold).toHaveAttribute('aria-pressed', 'true');

    const order = [
      canvas.getByRole('button', { name: 'Italic' }),
      canvas.getByRole('button', { name: 'Underline' }),
      canvas.getByRole('radio', { name: 'Align left' }),
      canvas.getByRole('radio', { name: 'Align center' }),
      canvas.getByRole('radio', { name: 'Align right' }),
      canvas.getByRole('button', { name: 'Copy' }),
      canvas.getByRole('button', { name: 'Cut' }),
      canvas.getByRole('button', { name: 'Paste' }),
    ];
    for (const control of order) {
      await userEvent.keyboard('{ArrowRight}');
      await expect(control).toHaveFocus();
    }
    // Moving through the alignment group does not choose an alignment.
    await expect(
      canvas.getByRole('radio', { name: 'Align left' }),
    ).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('button', { name: 'Cut' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Cut' })).toHaveFocus();
  },
};

/**
 * A column. Up and Down step through the controls, and the separators run across the column. The
 * toggle group takes the toolbar's orientation: a column of segments, announced as vertical.
 */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => <Formatting {...args} />,
  play: async ({ canvas, userEvent }) => {
    const toolbar = canvas.getByRole('toolbar', { name: 'Text formatting' });
    await expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
    for (const separator of canvas.getAllByRole('separator')) {
      await expect(separator).not.toHaveAttribute('aria-orientation');
      await expect(separator.getBoundingClientRect().height).toBe(1);
    }

    // The alignment group is a column, as it says it is: each segment under the one before.
    await expect(
      canvas.getByRole('radiogroup', { name: 'Alignment' }),
    ).toHaveAttribute('aria-orientation', 'vertical');
    const left = canvas.getByRole('radio', { name: 'Align left' });
    const center = canvas.getByRole('radio', { name: 'Align center' });
    await expect(center.getBoundingClientRect().left).toBe(
      left.getBoundingClientRect().left,
    );
    await expect(center.getBoundingClientRect().top).toBeGreaterThan(
      left.getBoundingClientRect().top,
    );

    const bold = canvas.getByRole('button', { name: 'Bold' });
    const italic = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(italic).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(italic).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(bold).toHaveFocus();

    // Down walks the column's segments in the order they are drawn.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(left).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(center).toHaveFocus();
  },
};

/**
 * A popover or a modal opened from a toolbar is not part of it: a `Separator` in one is horizontal,
 * and a `ToggleGroup` in one is a row, whatever the toolbar's orientation.
 */
export const OverlaysOpenedFromIt: Story = {
  render: (args) => (
    <div className='flex items-start gap-6'>
      <Toolbar {...args} aria-label='Document'>
        <DialogTrigger>
          <Button>Details</Button>
          <Popover>
            <AriaDialog
              aria-label='Details'
              className='flex w-56 flex-col gap-2 p-3 text-sm outline-0'
            >
              <p>12 pages</p>
              <Separator layer='overlay' />
              <p>Edited 2 days ago</p>
            </AriaDialog>
          </Popover>
        </DialogTrigger>
        <DialogTrigger>
          <Button>Properties</Button>
          <DialogModal>
            <Dialog title='Properties' closeLabel='Close'>
              <p className='text-sm'>Owner: Ada Lovelace</p>
              <Separator layer='overlay' />
              <p className='text-sm'>Shared with 3 people</p>
            </Dialog>
          </DialogModal>
        </DialogTrigger>
      </Toolbar>
      <Toolbar {...args} aria-label='View' orientation='vertical'>
        <DialogTrigger>
          <Button>Layout</Button>
          <Popover>
            <AriaDialog aria-label='Layout' className='p-3 outline-0'>
              <ToggleGroup aria-label='Density' defaultSelectedKeys={['cozy']}>
                <Toggle id='compact'>Compact</Toggle>
                <Toggle id='cozy'>Cozy</Toggle>
              </ToggleGroup>
            </AriaDialog>
          </Popover>
        </DialogTrigger>
      </Toolbar>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const isHorizontalLine = async (separator: HTMLElement) => {
      await expect(separator).not.toHaveAttribute('aria-orientation');
      await expect(separator.getBoundingClientRect().height).toBe(1);
    };

    await userEvent.click(canvas.getByRole('button', { name: 'Details' }));
    const details = await page.findByRole('dialog', { name: 'Details' });
    await isHorizontalLine(within(details).getByRole('separator'));
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: 'Properties' }));
    const properties = await page.findByRole('dialog', { name: 'Properties' });
    await isHorizontalLine(within(properties).getByRole('separator'));
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: 'Layout' }));
    const layout = await page.findByRole('dialog', { name: 'Layout' });
    const density = within(layout).getByRole('radiogroup', { name: 'Density' });
    await expect(density).toHaveAttribute('aria-orientation', 'horizontal');
    const compact = within(layout).getByRole('radio', { name: 'Compact' });
    const cozy = within(layout).getByRole('radio', { name: 'Cozy' });
    await expect(cozy.getBoundingClientRect().top).toBe(
      compact.getBoundingClientRect().top,
    );
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * The toolbar is one Tab stop: Tab leaves it for the next control, wherever the focus is inside
 * it, and Shift+Tab comes back to the control it left from.
 */
export const OneTabStop: Story = {
  render: (args) => (
    <div className='flex flex-col items-start gap-3'>
      <Button>Before</Button>
      <Formatting {...args} />
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const underline = canvas.getByRole('button', { name: 'Underline' });

    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Before' })).toHaveFocus();
    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(underline).toHaveFocus();

    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'After' })).toHaveFocus();
    pressTab(document, { isShift: true });
    await expect(underline).toHaveFocus();
  },
};
