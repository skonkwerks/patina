import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import {
  Token,
  TokenField,
  type TokenFieldProps,
  type TokenFieldSegment,
  TokenFieldValue,
} from './index.js';

/**
 * A tag list: text typed before a comma or a line break becomes a token, and the text after the last
 * separator stays text until it is ended. The default `createFieldValue` builds a new value of this
 * class from its segments, so nothing else is overridden.
 */
class TagFieldValue extends TokenFieldValue {
  protected override tokenize(text: string): TokenFieldSegment[] {
    const parts = text.split(/[,\n]/);
    const last = parts.pop() ?? '';
    const tokens: TokenFieldSegment[] = parts
      .map((part) => part.trim())
      .filter((part) => part !== '')
      .map((part) => ({ type: 'token', text: part }));
    return [...tokens, { type: 'text', text: last }];
  }
}

const greeting = () =>
  new TokenFieldValue([
    { type: 'text', text: 'Thanks ' },
    { type: 'token', text: '@sam' },
    { type: 'text', text: ', merging now.' },
  ]);

const meta = {
  title: 'Aria/TokenField',
  component: TokenField,
  args: {
    label: 'Message',
    children: (segment) => <Token>{segment.text}</Token>,
  },
  decorators: [
    (Story) => (
      <div className='w-96'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TokenFieldProps>;

export default meta;
type Story = StoryObj<TokenFieldProps>;

/** Text with a token inside it; the field is a text box named by its label. */
export const Default: Story = {
  args: { defaultValue: greeting() },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    // React Aria puts a zero-width space on each side of a token, for the caret.
    await expect(field.textContent.replaceAll('\u200b', '')).toBe(
      'Thanks @sam, merging now.',
    );
    await expect(canvas.getByText('@sam')).toBeVisible();
  },
};

export const WithDescription: Story = {
  args: {
    defaultValue: greeting(),
    description: 'Mention a teammate to notify them.',
  },
};

/**
 * Empty: the placeholder shows, and goes as soon as text is typed. A press puts the focus in the
 * field, with the focus ring, as a text input shows it.
 */
export const Empty: Story = {
  args: { placeholder: 'Thanks @sam' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await expect(field).toBeEmptyDOMElement();
    await expect(field).toHaveAttribute('data-placeholder', 'Thanks @sam');
    await expect(getComputedStyle(field, '::before').content).toBe(
      '"Thanks @sam"',
    );
    await userEvent.click(field);
    await expect(field).toHaveFocus();
    await expect(getComputedStyle(field).outlineWidth).toBe('2px');
    await userEvent.keyboard('Hi');
    await waitFor(async () => {
      await expect(field).toHaveTextContent('Hi');
    });
  },
};

/** A field of tags: a comma ends a tag, Backspace after a tag removes it. */
export const Tags: Story = {
  render: function Render(args: TokenFieldProps) {
    const [value, setValue] = useState<TokenFieldValue>(
      () =>
        new TagFieldValue([
          { type: 'token', text: 'Design' },
          { type: 'token', text: 'Research' },
        ]),
    );
    const tags = value.segments.filter((segment) => segment.type === 'token');
    return (
      <div className='flex flex-col gap-2'>
        <TokenField
          {...args}
          label='Topics'
          description='End each topic with a comma.'
          value={value}
          onChange={setValue}
        />
        <p role='status' className='text-surface-foreground-muted text-xs'>
          {tags.length === 1 ? '1 topic' : `${String(tags.length)} topics`}
        </p>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Topics' });
    const status = canvas.getByRole('status');
    await expect(status).toHaveTextContent('2 topics');

    // Typing starts at the end of the text.
    await userEvent.type(field, 'Sales,');
    await waitFor(async () => {
      await expect(status).toHaveTextContent('3 topics');
    });
    await expect(canvas.getByText('Sales')).toBeVisible();

    await userEvent.keyboard('{Backspace}');
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 topics');
    });
  },
};

/** Line breaks allowed: the field is a few lines tall. */
export const Multiline: Story = {
  args: { defaultValue: greeting(), allowsNewlines: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Message' }),
    ).toHaveAttribute('aria-multiline', 'true');
  },
};

/** Disabled: the field takes no text, and its label and box fade. */
export const Disabled: Story = {
  args: { defaultValue: greeting(), isDisabled: true },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await expect(field).toHaveAttribute('aria-disabled', 'true');
    await expect(field).toHaveAttribute('contenteditable', 'false');
  },
};
