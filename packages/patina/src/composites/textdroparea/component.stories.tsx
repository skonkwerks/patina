import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextDropArea } from './index.ts';

const meta = {
  title: 'Composites/TextDropArea',
  component: TextDropArea,
  args: {
    label: 'Description',
    placeholder: 'What is this project about?',
    dropType: 'text/plain',
    onTextDrop: () => undefined,
    dropErrorMessage: 'The dropped text could not be read.',
    dropRefusedMessage: 'Drop a single piece of plain text.',
  },
} satisfies Meta<typeof TextDropArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag plain text onto the field to append it. A plain `TextArea` takes no drop. */
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return (
      <TextDropArea
        {...args}
        value={value}
        onChange={setValue}
        description='Drop plain text here to append it.'
        dropType='text/plain'
        onTextDrop={(text) => setValue((current) => current + text)}
        dropErrorMessage='The dropped text could not be read.'
        dropRefusedMessage='Drop a single piece of plain text.'
      />
    );
  },
};
