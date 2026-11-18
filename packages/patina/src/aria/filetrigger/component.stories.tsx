import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { Button } from '../button/index.js';
import { FileTrigger } from './index.js';

const meta = {
  title: 'Aria/FileTrigger',
  component: FileTrigger,
  args: {},
} satisfies Meta<typeof FileTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** React Aria's file trigger around any button; the chosen names show beside it. */
const TriggerWithResult = ({
  label,
  ...args
}: ComponentProps<typeof FileTrigger> & { label: string }) => {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div className='flex items-center gap-3'>
      <FileTrigger
        {...args}
        onSelect={(list) => setFiles(list ? [...list].map((f) => f.name) : [])}
      >
        <Button>{label}</Button>
      </FileTrigger>
      <span className='text-canvas-foreground text-sm'>
        {files.length > 0 ? files.join(', ') : 'Nothing chosen'}
      </span>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <TriggerWithResult {...args} label='Choose a file' />,
};

export const Multiple: Story = {
  args: { allowsMultiple: true },
  render: (args) => <TriggerWithResult {...args} label='Choose files' />,
};

/** Choosing a folder: the files in it are handed over. */
export const Directory: Story = {
  args: { acceptDirectory: true },
  render: (args) => <TriggerWithResult {...args} label='Choose a folder' />,
};
