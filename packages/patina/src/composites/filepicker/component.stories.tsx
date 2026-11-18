import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { Button } from '../../aria/button/index.js';
import { FilePicker } from './index.js';

const meta = {
  title: 'Composites/FilePicker',
  component: FilePicker,
  args: { onFiles: () => undefined, children: null },
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Any shared button as the picker's child, and the names of the chosen files under it. */
const PickerWithResult = (args: ComponentProps<typeof FilePicker>) => {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div className='flex flex-col items-start gap-3'>
      <FilePicker
        {...args}
        onFiles={(chosen) => setFiles(chosen.map((file) => file.name))}
      >
        <Button variant='solid' tone='primary'>
          Upload
        </Button>
      </FilePicker>
      <p className='text-canvas-foreground text-sm'>
        Chosen: {files.length > 0 ? files.join(', ') : 'nothing yet'}
      </p>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PickerWithResult {...args} />,
};

export const SingleImage: Story = {
  args: { allowsMultiple: false, acceptedFileTypes: ['image/*'] },
  render: (args) => <PickerWithResult {...args} />,
};
