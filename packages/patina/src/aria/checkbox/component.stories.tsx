import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox, CheckboxGroup } from './index.ts';

const meta = {
  title: 'Aria/Checkbox',
  component: Checkbox,
  args: { children: 'Email me a weekly summary' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { defaultSelected: true } };

/** A description under the label, indented to line up with it. */
export const WithDescription: Story = {
  args: { description: 'Sent every Monday morning.' },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const DisabledSelected: Story = {
  args: { isDisabled: true, defaultSelected: true },
};

export const Required: Story = {
  args: { children: 'I agree to the terms', isRequired: true },
};

/** Invalid: the error stands under the label, as a field's does, such as a required box left unchecked. */
export const WithError: Story = {
  args: {
    children: 'I agree to the terms',
    isRequired: true,
    errorMessage: 'Agree to the terms to continue.',
  },
};

/** Controlled from outside: the parent holds the value. */
export const Controlled: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState(false);
    return (
      <div className='flex flex-col gap-2'>
        <Checkbox {...args} isSelected={selected} onChange={setSelected} />
        <p className='text-surface-foreground-muted text-xs'>
          {selected ? 'Checked' : 'Not checked'}
        </p>
      </div>
    );
  },
};

/** A labeled group whose value is the list of checked values. */
export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label='Notifications'
      description='Choose where we reach you.'
      defaultValue={['email']}
    >
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
      <Checkbox value='push' description='On devices where you are signed in.'>
        Push notification
      </Checkbox>
    </CheckboxGroup>
  ),
};

/** A group with a caller's error: marked invalid and the message shows under it. */
export const GroupWithError: Story = {
  render: () => (
    <CheckboxGroup
      label='Notifications'
      errorMessage='Choose at least one way to reach you.'
    >
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
    </CheckboxGroup>
  ),
};

export const GroupDisabled: Story = {
  render: () => (
    <CheckboxGroup label='Notifications' isDisabled defaultValue={['sms']}>
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
    </CheckboxGroup>
  ),
};
