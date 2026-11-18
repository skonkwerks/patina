import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.ts';
import { Button } from '../button/index.ts';
import {
  ListBox,
  ListBoxItem,
  type ListBoxProps,
  ListBoxSection,
} from './index.ts';

type Flavor = { id: string; name: string };

const flavors: Flavor[] = [
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'mint', name: 'Mint' },
  { id: 'strawberry', name: 'Strawberry' },
  { id: 'vanilla', name: 'Vanilla' },
];

/** The checkbox mark an option draws, the one bordered box in an option, checked or not. */
const CHECKBOX_MARK = 'span[class~="border"]';

const meta = {
  title: 'Aria/ListBox',
  component: ListBox<Flavor>,
  args: {
    'aria-label': 'Flavor',
    selectionMode: 'single',
    items: flavors,
    className: 'w-56',
    children: (item: Flavor) => (
      <ListBoxItem id={item.id}>{item.name}</ListBoxItem>
    ),
  },
} satisfies Meta<typeof ListBox<Flavor>>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One Tab stop: the focus enters on the first option, the arrow keys move it, typing jumps to the
 * option that starts with the typed text, and Space chooses the focused option, marked with a check.
 * In single selection a new choice replaces the old.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    await userEvent.tab();
    await expect(
      within(listBox).getByRole('option', { name: 'Chocolate' }),
    ).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    const mint = within(listBox).getByRole('option', { name: 'Mint' });
    await expect(mint).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(mint).toHaveAttribute('aria-selected', 'true');

    // A space typed right after a letter is part of the typed text, so this choice is by pointer.
    await userEvent.keyboard('v');
    const vanilla = within(listBox).getByRole('option', { name: 'Vanilla' });
    await expect(vanilla).toHaveFocus();
    await userEvent.click(vanilla);
    await expect(vanilla).toHaveAttribute('aria-selected', 'true');
    await expect(mint).toHaveAttribute('aria-selected', 'false');
  },
};

export const WithValue: Story = {
  args: { defaultSelectedKeys: ['strawberry'] },
};

/** Several flavors: each press toggles its option, and every chosen one is checked. */
export const Multiple: Story = {
  args: {
    selectionMode: 'multiple',
    defaultSelectedKeys: ['mint'],
  },
  play: async ({ canvas, userEvent }) => {
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    await expect(listBox).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(
      within(listBox).getByRole('option', { name: 'Vanilla' }),
    );
    await expect(
      within(listBox).getByRole('option', { name: 'Vanilla' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(listBox).getByRole('option', { name: 'Mint' }),
    ).toHaveAttribute('aria-selected', 'true');
    // Every option shows a checkbox, chosen or not.
    await expect(listBox.querySelectorAll(CHECKBOX_MARK)).toHaveLength(
      flavors.length,
    );
  },
};

/**
 * Several flavors chosen by replacement: a press chooses that flavor alone, and a modifier key adds
 * to the choice. Since a press does not toggle an option, the options show the single-choice check,
 * never a checkbox.
 */
export const ReplaceSelection: Story = {
  args: {
    selectionMode: 'multiple',
    selectionBehavior: 'replace',
    defaultSelectedKeys: ['mint'],
  },
  play: async ({ canvas, userEvent }) => {
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    await expect(listBox.querySelectorAll(CHECKBOX_MARK)).toHaveLength(0);
    await userEvent.click(
      within(listBox).getByRole('option', { name: 'Vanilla' }),
    );
    await expect(
      within(listBox).getByRole('option', { name: 'Vanilla' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(listBox).getByRole('option', { name: 'Mint' }),
    ).toHaveAttribute('aria-selected', 'false');
  },
};

/** One flavor that cannot be chosen: drawn disabled, and passed over by the arrow keys. */
export const DisabledItem: Story = {
  args: { disabledKeys: ['mint'] },
  play: async ({ canvas, userEvent }) => {
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      within(listBox).getByRole('option', { name: 'Strawberry' }),
    ).toHaveFocus();
  },
};

type Group = { id: string; name: string; flavors: Flavor[] };

const groups: Group[] = [
  { id: 'classic', name: 'Classic', flavors: flavors.slice(0, 2) },
  { id: 'fruit', name: 'Fruit', flavors: flavors.slice(2) },
];

/** Options in titled groups; each group is named by its title. */
export const Sections: Story = {
  render: () => (
    <ListBox<Group>
      aria-label='Flavor'
      selectionMode='single'
      items={groups}
      className='w-56'
    >
      {(group) => (
        <ListBoxSection id={group.id} title={group.name} items={group.flavors}>
          {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
        </ListBoxSection>
      )}
    </ListBox>
  ),
  play: async ({ canvas }) => {
    const fruit = canvas.getByRole('group', { name: 'Fruit' });
    await expect(
      within(fruit)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Strawberry', 'Vanilla']);
  },
};

/**
 * The list is one Tab stop: Tab enters it on the first option, and the next Tab leaves it for the
 * control after it, never for the next option. Shift+Tab comes back to the option that had the
 * focus.
 */
export const OneTabStop: Story = {
  render: (args) => (
    <div className='flex flex-col items-start gap-3'>
      <ListBox {...args} />
      <Button>Order</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    pressTab(document);
    await expect(
      within(listBox).getByRole('option', { name: 'Chocolate' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Order' })).toHaveFocus();
    pressTab(document, { isShift: true });
    await expect(
      within(listBox).getByRole('option', { name: 'Mint' }),
    ).toHaveFocus();
  },
};

/** A list with no options says so, and takes the focus itself, with the focus ring. */
export const Empty: Story = {
  args: { items: [], emptyLabel: 'No flavors in stock' },
  play: async ({ canvas, userEvent }) => {
    const listBox = canvas.getByRole('listbox', { name: 'Flavor' });
    await expect(listBox).toHaveTextContent('No flavors in stock');
    await userEvent.tab();
    await expect(listBox).toHaveFocus();
  },
};

/** A list taller than its height scrolls inside its frame. */
export const Scrolling: Story = {
  args: {
    className: 'w-56 max-h-40',
    items: [
      ...flavors,
      ...flavors.map((f) => ({ id: `${f.id}2`, name: `${f.name} swirl` })),
    ],
  },
};

export const Controlled: Story = {
  render: function Render(args: ListBoxProps<Flavor>) {
    const [selection, setSelection] = useState<Selection>(
      () => new Set(['vanilla']),
    );
    const chosen = selection === 'all' ? 'all' : [...selection].join(', ');
    return (
      <div className='flex flex-col gap-2'>
        <ListBox
          {...args}
          selectedKeys={selection}
          onSelectionChange={setSelection}
        />
        <p className='text-surface-foreground-muted text-xs'>
          Chosen: {chosen === '' ? 'nothing' : chosen}
        </p>
      </div>
    );
  },
};
