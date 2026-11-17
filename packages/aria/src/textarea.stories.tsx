import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button.tsx';
import { InfoButton } from './infobutton.tsx';
import { TextArea } from './textarea.tsx';

const meta = {
  title: 'Aria/TextArea',
  component: TextArea,
  args: { label: 'Description', placeholder: 'What is this project about?' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      'A shared library of React Aria wrappers, themed with Tailwind tokens.',
  },
};

export const WithDescription: Story = {
  args: { description: 'Markdown is supported.' },
};

export const WithError: Story = {
  args: { errorMessage: 'A description is required.' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Locked while saving.' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'Read only text.' },
};

export const FewerRows: Story = { args: { rows: 3 } };

/** A help control beside the label, and actions at the end of the label row. */
export const WithContextualHelpAndLabelActions: Story = {
  args: {
    contextualHelp: <InfoButton aria-label='About descriptions' />,
    labelActions: (
      <Button variant='link' tone='primary'>
        Use template
      </Button>
    ),
  },
};

/** Opt-in text drops: drag plain text onto the field to insert it. */
export const WithTextDrop: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <TextArea
        {...args}
        value={value}
        onChange={setValue}
        description='Drop plain text here to append it.'
        textDrop={{
          type: 'text/plain',
          onDrop: (text) => setValue((current) => current + text),
          errorMessage: 'The dropped text could not be read.',
          refusedMessage: 'Drop a single piece of plain text.',
        }}
      />
    );
  },
};
