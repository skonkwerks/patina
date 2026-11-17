import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../button/index.ts';
import { Checkbox } from '../checkbox/index.ts';
import { TextField } from '../textfield/index.ts';
import { Form } from './index.ts';

const meta = {
  title: 'Aria/Form',
  component: Form,
  args: { onSubmit: () => undefined },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Submit with a field empty: nothing is submitted, errors show, and focus moves to the first. */
export const Validation: Story = {
  render: function Render(args) {
    const [submitted, setSubmitted] = useState(false);
    return (
      <Form
        {...args}
        onSubmit={() => {
          setSubmitted(true);
          args.onSubmit();
        }}
      >
        <TextField label='Name' name='name' isRequired />
        <TextField label='Email' name='email' type='email' isRequired />
        <Checkbox name='terms' isRequired>
          I agree to the terms
        </Checkbox>
        <Button
          type='submit'
          variant='solid'
          tone='primary'
          className='self-start'
        >
          Create account
        </Button>
        {submitted && (
          <p role='status' className='text-success text-sm'>
            Submitted.
          </p>
        )}
      </Form>
    );
  },
};

/** A server's answer about one field, given as `validationErrors`. */
export const ServerErrors: Story = {
  render: (args) => (
    <Form
      {...args}
      validationErrors={{ email: 'That email is already registered.' }}
    >
      <TextField label='Name' name='name' defaultValue='Ada' />
      <TextField
        label='Email'
        name='email'
        type='email'
        defaultValue='ada@example.com'
      />
      <Button
        type='submit'
        variant='solid'
        tone='primary'
        className='self-start'
      >
        Create account
      </Button>
    </Form>
  ),
};
