import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';

import { Select, SelectItem, type SelectProps } from './index.ts';

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
      <SelectItem id={item.id} isDisabled={item.isDisabled}>
        {item.name}
      </SelectItem>
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

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Choose a region' },
};

export const WithValue: Story = { args: { defaultValue: 'eu-central' } };

export const WithDescription: Story = {
  args: { description: 'Where your data is stored.' },
};

/** A muted count beside the label, formatted by the caller. */
export const WithCount: Story = { args: { count: '(4)' } };

/** While the choices are still being read: a spinner and a word stand where the description does. */
export const Pending: Story = {
  args: { isPending: true, pendingText: 'Loading regions…', items: [] },
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
