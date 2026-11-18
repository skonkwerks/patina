import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';

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

/** The description stands under the label and above the input, and describes the input. */
export const WithDescription: Story = {
  args: { description: 'Shown to everyone on your team.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Project name' }),
    ).toHaveAccessibleDescription('Shown to everyone on your team.');
  },
};

/**
 * A field the person may leave empty: the app's words follow the label, quieter, and are read with
 * it. The field's validation is unchanged; whether it may be left empty is `isRequired`.
 */
export const Optional: Story = {
  args: { optionalText: '(optional)' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Project name (optional)' }),
    ).toBeInTheDocument();
  },
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

/** An info control beside the label, outside the label itself, such as one that opens the help. */
export const WithInfo: Story = {
  args: {
    optionalText: '(optional)',
    info: <InfoButton aria-label='About project names' />,
    description: 'Shown to everyone on your team.',
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
