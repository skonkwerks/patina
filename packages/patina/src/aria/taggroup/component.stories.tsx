import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.js';
import { Button } from '../button/index.js';
import { Tag, TagGroup, type TagGroupProps } from './index.js';

type Label = { id: string; name: string };

const labels: Label[] = [
  { id: 'bug', name: 'Bug' },
  { id: 'design', name: 'Design' },
  { id: 'docs', name: 'Documentation' },
  { id: 'urgent', name: 'Urgent' },
];

const meta = {
  title: 'Aria/TagGroup',
  component: TagGroup<Label>,
  args: {
    label: 'Labels',
    items: labels,
    children: (item: Label) => <Tag id={item.id}>{item.name}</Tag>,
  },
  decorators: [
    (Story) => (
      <div className='w-72'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TagGroupProps<Label>>;

export default meta;
type Story = StoryObj<TagGroupProps<Label>>;

/** Tags that only label: one Tab stop, the arrow keys between the tags. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('grid', { name: 'Labels' });
    await userEvent.tab();
    await expect(within(group).getByRole('row', { name: 'Bug' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      within(group).getByRole('row', { name: 'Design' }),
    ).toHaveFocus();
  },
};

/** The tags in state, removable: each by its remove control, Delete, or Backspace. */
const RemovableTags = (args: TagGroupProps<Label>) => {
  const [shown, setShown] = useState(labels);
  return (
    <TagGroup
      {...args}
      items={shown}
      onRemove={(keys: Set<Key>) =>
        setShown((current) => current.filter((label) => !keys.has(label.id)))
      }
    />
  );
};

/** Removable tags: each ends with its remove control. */
export const Removable: Story = {
  args: { emptyLabel: 'No labels yet' },
  render: (args) => <RemovableTags {...args} />,
};

/**
 * Backspace removes the focused tag and the focus moves to the next one; the remove control removes
 * its own tag. Once the last is gone, the group says it is empty and keeps the focus, which never
 * falls to the page.
 */
export const RemoveEveryTag: Story = {
  args: { emptyLabel: 'No labels yet' },
  render: (args) => <RemovableTags {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const group = canvas.getByRole('grid', { name: 'Labels' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{Backspace}');
    await waitFor(async () => {
      await expect(
        within(group).queryByRole('row', { name: 'Design' }),
      ).not.toBeInTheDocument();
    });
    await expect(
      within(group).getByRole('row', { name: 'Documentation' }),
    ).toHaveFocus();

    await userEvent.click(
      within(group).getByRole('button', { name: 'Remove Bug' }),
    );
    await waitFor(async () => {
      await expect(
        within(group).queryByRole('row', { name: 'Bug' }),
      ).not.toBeInTheDocument();
    });

    await userEvent.click(
      within(group).getByRole('row', { name: 'Documentation' }),
    );
    await userEvent.keyboard('{Delete}');
    await waitFor(async () => {
      await expect(within(group).getAllByRole('row')).toHaveLength(1);
    });
    await userEvent.keyboard('{Backspace}');
    await waitFor(async () => {
      await expect(group).toHaveTextContent('No labels yet');
    });
    await expect(canvasElement.ownerDocument.activeElement).toBe(group);
    // The ring stands clear of the line that says the group is empty.
    await expect(getComputedStyle(group).outlineOffset).toBe('4px');
  },
};

/**
 * The group is one Tab stop: Tab enters on the first tag, and the arrow keys move between tags. In a
 * removable group the focused tag's remove control is the one further stop React Aria gives it, so
 * Tab goes from the tag to its remove control and then leaves the group for the control after it,
 * past every other tag. Shift+Tab comes back into the group.
 */
export const OneTabStop: Story = {
  render: (args) => (
    <div className='flex flex-col items-start gap-3'>
      <RemovableTags {...args} />
      <Button>Save</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const group = canvas.getByRole('grid', { name: 'Labels' });
    pressTab(document);
    await expect(within(group).getByRole('row', { name: 'Bug' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    pressTab(document);
    await expect(
      within(group).getByRole('button', { name: 'Remove Design' }),
    ).toHaveFocus();
    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Save' })).toHaveFocus();
    pressTab(document, { isShift: true });
    await expect(
      document.activeElement !== null && group.contains(document.activeElement),
    ).toBe(true);
  },
};

/** Tags to filter by: Space or Enter selects the focused tag, filled with the primary color. */
export const Selectable: Story = {
  args: {
    label: 'Show',
    selectionMode: 'multiple',
    defaultSelectedKeys: ['bug'],
  },
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('grid', { name: 'Show' });
    const bug = within(group).getByRole('row', { name: 'Bug' });
    const design = within(group).getByRole('row', { name: 'Design' });
    await expect(bug).toHaveAttribute('aria-selected', 'true');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight} ');
    await expect(design).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}{Enter}');
    await expect(bug).toHaveAttribute('aria-selected', 'false');
  },
};

export const Controlled: Story = {
  render: function Render(args: TagGroupProps<Label>) {
    const [selection, setSelection] = useState<Selection>(
      () => new Set(['docs']),
    );
    const chosen = selection === 'all' ? 'all' : [...selection].join(', ');
    return (
      <div className='flex flex-col gap-2'>
        <TagGroup
          {...args}
          label='Show'
          selectionMode='multiple'
          selectedKeys={selection}
          onSelectionChange={setSelection}
        />
        <p className='text-surface-foreground-muted text-xs'>
          Showing: {chosen === '' ? 'everything' : chosen}
        </p>
      </div>
    );
  },
};

/** A tag that cannot be selected: drawn disabled, and passed over by the arrow keys. */
export const DisabledTag: Story = {
  args: {
    label: 'Show',
    selectionMode: 'multiple',
    disabledKeys: ['design'],
  },
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('grid', { name: 'Show' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      within(group).getByRole('row', { name: 'Documentation' }),
    ).toHaveFocus();
  },
};

export const WithDescription: Story = {
  args: { description: 'Labels help others find this issue.' },
};

/** An error stands under the tags and describes the group. */
export const WithError: Story = {
  args: { errorMessage: 'Remove a label to add another.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('grid', { name: 'Labels' }),
    ).toHaveAccessibleDescription('Remove a label to add another.');
  },
};

/** No tags: the group says so. React Aria then gives the list the `group` role, as it holds no rows. */
export const Empty: Story = {
  args: { items: [], emptyLabel: 'No labels yet' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('group', { name: 'Labels' }),
    ).toHaveTextContent('No labels yet');
  },
};

/** No visible label: the group carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Labels' },
};
