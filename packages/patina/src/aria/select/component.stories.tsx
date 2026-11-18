import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { ListBoxItem, ListBoxSection } from '../listbox/index.ts';
import { Select, type SelectProps } from './index.ts';

type Option = { id: string; name: string; isDisabled?: boolean };

const regions: Option[] = [
  { id: 'us-east', name: 'US East' },
  { id: 'us-west', name: 'US West' },
  { id: 'eu-central', name: 'EU Central' },
  { id: 'ap-south', name: 'Asia Pacific South' },
];

const meta = {
  title: 'Aria/Select',
  component: Select<Option>,
  args: {
    label: 'Region',
    items: regions,
    children: (item: Option) => (
      <ListBoxItem id={item.id} isDisabled={item.isDisabled}>
        {item.name}
      </ListBoxItem>
    ),
  },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SelectProps<Option>>;

export default meta;
type Story = StoryObj<SelectProps<Option>>;

/**
 * The play context. The props' pending union keeps Storybook from inferring it for a story, so
 * each play function names it.
 */
type Context = StoryContext;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Choose a region' },
};

/**
 * A chosen region: the trigger shows its text alone. The option's check mark belongs to the list,
 * never to the trigger.
 */
export const WithValue: Story = {
  args: { defaultValue: 'eu-central' },
  play: async ({ canvas }: Context) => {
    const trigger = canvas.getByRole('button', { name: /Region/ });
    await expect(trigger).toHaveTextContent(/^EU Central$/);
    await expect(trigger.querySelectorAll('svg')).toHaveLength(1);
  },
};

export const WithDescription: Story = {
  args: { description: 'Where your data is stored.' },
};

/** A muted count beside the label, formatted by the caller. */
export const WithCount: Story = { args: { count: '(4)' } };

/**
 * While the choices are still being read: the spinner and its words stand at the end of the label
 * row, on the label's line, and describe the trigger.
 */
export const Pending: Story = {
  args: { isPending: true, pendingText: 'Loading regions…', items: [] },
  play: async ({ canvas }: Context) => {
    const trigger = canvas.getByRole('button', { name: /Region/ });
    await expect(trigger).toHaveAccessibleDescription('Loading regions…');
    const words = canvas.getByText('Loading regions…');
    const [label] = canvas.getAllByText('Region', {
      ignore: '[aria-hidden="true"] *, script, style, option',
    });
    if (label === undefined) {
      throw new Error('No label');
    }
    const middle = (element: Element) => {
      const box = element.getBoundingClientRect();
      return (box.top + box.bottom) / 2;
    };
    await expect(Math.abs(middle(words) - middle(label))).toBeLessThanOrEqual(
      1,
    );
    await expect(words.getBoundingClientRect().left).toBeGreaterThan(
      label.getBoundingClientRect().right,
    );
  },
};

export const WithError: Story = {
  args: { errorMessage: 'Choose a region to continue.' },
};

export const Required: Story = { args: { isRequired: true } };

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'us-east' },
};

/** One choice that cannot be chosen. */
export const DisabledItem: Story = {
  args: {
    items: regions.map((region) =>
      region.id === 'ap-south' ? { ...region, isDisabled: true } : region,
    ),
  },
};

type Area = { id: string; name: string; regions: Option[] };

const areas: Area[] = [
  { id: 'americas', name: 'Americas', regions: regions.slice(0, 2) },
  { id: 'elsewhere', name: 'Europe and Asia', regions: regions.slice(2) },
];

/** Choices in titled groups, the shared `ListBoxSection`; the chosen one is checked. */
export const Sections: Story = {
  render: () => (
    <Select<Area> label='Region' items={areas} defaultValue='eu-central'>
      {(area) => (
        <ListBoxSection id={area.id} title={area.name} items={area.regions}>
          {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
        </ListBoxSection>
      )}
    </Select>
  ),
};

const mumbai = 'Asia Pacific South (Mumbai, the first region in India)';
const singapore = 'Asia Pacific South (Singapore, the first region in Asia)';

/**
 * Long options that begin alike: each option's label wraps inside the list, so the two can be told
 * apart; the trigger keeps one line.
 */
export const LongOptions: Story = {
  args: {
    items: [
      { id: 'mumbai', name: mumbai },
      { id: 'singapore', name: singapore },
    ],
  },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Region/ }));
    const listBox = await page.findByRole('listbox');
    for (const name of [mumbai, singapore]) {
      const label = within(listBox).getByText(name);
      // All of the text is shown: nothing runs past the label's box to be cut off.
      await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
      await expect(label.getClientRects().length).toBeGreaterThan(0);
    }
  },
};

/** No visible label, as in a toolbar: the select carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Region' },
};

export const Controlled: Story = {
  render: function Render(args: SelectProps<Option>) {
    const [value, setValue] = useState<Key | null>('us-west');
    return (
      <div className='flex flex-col gap-2'>
        <Select {...args} value={value} onChange={setValue} />
        <p className='text-surface-foreground-muted text-xs'>
          Chosen: {value === null ? 'nothing' : String(value)}
        </p>
      </div>
    );
  },
};
