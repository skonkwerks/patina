import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Alert } from '../../composites/alert/index.js';
import { Button } from '../button/index.js';
import { Checkbox } from '../checkbox/index.js';
import { TextField } from '../textfield/index.js';
import { Form } from './index.js';

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

/** The action row: Cancel, then the form's one action, at the end of the line. */
const actions = (
  <>
    <Button variant='ghost'>Cancel</Button>
    <Button type='submit' variant='solid' tone='primary'>
      Create account
    </Button>
  </>
);

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
        actions={actions}
      >
        <TextField label='Name' name='name' isRequired />
        <TextField label='Email' name='email' type='email' isRequired />
        <Checkbox name='terms' isRequired>
          I agree to the terms
        </Checkbox>
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
      actions={actions}
    >
      <TextField label='Name' name='name' defaultValue='Ada' />
      <TextField
        label='Email'
        name='email'
        type='email'
        defaultValue='ada@example.com'
      />
    </Form>
  ),
};

/**
 * A rejected submit: the server's message stands directly above the action row, and stays there
 * until the next submit, so leaving a field never moves the buttons.
 */
export const RejectedSubmit: Story = {
  render: function Render(args) {
    const [failure, setFailure] = useState<string | undefined>(undefined);
    return (
      <Form
        {...args}
        onSubmit={() => {
          setFailure('The server is not answering. Try again in a minute.');
        }}
        errorText={
          failure === undefined ? undefined : (
            <Alert tone='error'>{failure}</Alert>
          )
        }
        actions={actions}
      >
        <TextField label='Name' name='name' defaultValue='Ada' />
      </Form>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const submit = canvas.getByRole('button', { name: 'Create account' });
    await userEvent.click(submit);
    const message = await waitFor(() => canvas.getByRole('alert'));
    // The message stands between the fields and the action row.
    const name = canvas.getByRole('textbox', { name: 'Name' });
    await expect(
      name.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await expect(
      message.compareDocumentPosition(submit) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await expect(message.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      submit.getBoundingClientRect().top,
    );
    // The action row ends where the form does: Cancel, then the action, at the end of the line.
    const form = submit.closest('form');
    if (form === null) {
      throw new Error('The submit button is outside the form');
    }
    await expect(Math.round(submit.getBoundingClientRect().right)).toBe(
      Math.round(form.getBoundingClientRect().right),
    );
  },
};
