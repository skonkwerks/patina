import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { InfoButton } from '../../composites/infobutton/index.ts';
import { TextField } from './index.ts';

const meta = {
  title: 'Aria/TextField',
  component: TextField,
  args: { label: 'Project name', placeholder: 'My project' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 'Patina' } };

export const WithDescription: Story = {
  args: { description: 'Shown to everyone on your team.' },
};

/** A caller's error: the field is marked invalid and the message shows under it. */
export const WithError: Story = {
  args: {
    defaultValue: 'x',
    errorMessage: 'A name needs at least three characters.',
  },
};

/** Required: its error shows when a form around it is submitted empty (see Aria/Form). */
export const Required: Story = { args: { isRequired: true } };

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Patina' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'Patina' },
};

/** A help control beside the label, outside the label itself. */
export const WithContextualHelp: Story = {
  args: {
    contextualHelp: <InfoButton aria-label='About project names' />,
  },
};

/** No visible label, as in a toolbar: the field carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Project name' },
};

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: undefined },
};

/** Controlled, with an error that follows the value as it is typed. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <TextField
        {...args}
        value={value}
        onChange={setValue}
        errorMessage={
          value.length > 0 && value.length < 3
            ? 'A name needs at least three characters.'
            : undefined
        }
      />
    );
  },
};
