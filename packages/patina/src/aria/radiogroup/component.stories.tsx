import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Radio, RadioGroup } from './index.ts';

const meta = {
  title: 'Aria/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Visibility',
    children: (
      <>
        <Radio value='private'>Private</Radio>
        <Radio value='team'>Team</Radio>
        <Radio value='public'>Public</Radio>
      </>
    ),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = { args: { defaultValue: 'team' } };

/** Each choice explains what choosing it means. */
export const WithDescriptions: Story = {
  args: {
    defaultValue: 'private',
    description: 'You can change this later.',
    children: (
      <>
        <Radio value='private' description='Only you can see it.'>
          Private
        </Radio>
        <Radio value='team' description='Everyone on your team can see it.'>
          Team
        </Radio>
        <Radio value='public' description='Anyone with the link can see it.'>
          Public
        </Radio>
      </>
    ),
  },
};

export const WithError: Story = {
  args: { errorMessage: 'Choose who can see this.' },
};

export const Required: Story = { args: { isRequired: true } };

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'team' },
};

/** One choice unavailable while the others can be chosen. */
export const OneDisabled: Story = {
  args: {
    children: (
      <>
        <Radio value='private'>Private</Radio>
        <Radio value='team'>Team</Radio>
        <Radio value='public' isDisabled>
          Public
        </Radio>
      </>
    ),
  },
};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

/** No visible label: the group carries `aria-label`, as under a heading that names it. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Visibility' },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('public');
    return (
      <div className='flex flex-col gap-2'>
        <RadioGroup {...args} value={value} onChange={setValue} />
        <p className='text-surface-foreground-muted text-xs'>Chosen: {value}</p>
      </div>
    );
  },
};
