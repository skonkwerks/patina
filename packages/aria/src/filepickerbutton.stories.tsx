import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { FilePickerButton } from './filepickerbutton.tsx';

const meta = {
  title: 'Aria/FilePickerButton',
  component: FilePickerButton,
  args: { label: 'Choose files', onFiles: () => undefined },
} satisfies Meta<typeof FilePickerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The button, and the names of the chosen files beside it. */
const ButtonWithResult = (args: ComponentProps<typeof FilePickerButton>) => {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div className='flex items-center gap-3'>
      <FilePickerButton
        {...args}
        onFiles={(chosen) => setFiles(chosen.map((file) => file.name))}
      />
      <span className='text-canvas-foreground text-sm'>
        {files.length > 0 ? files.join(', ') : 'Nothing chosen'}
      </span>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ButtonWithResult {...args} />,
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => <ButtonWithResult {...args} />,
};

export const SingleImage: Story = {
  args: {
    label: 'Choose an image',
    allowsMultiple: false,
    acceptedFileTypes: ['image/*'],
  },
  render: (args) => <ButtonWithResult {...args} />,
};

/** What the chosen files started is still running. */
export const Pending: Story = { args: { isPending: true } };

export const Disabled: Story = { args: { isDisabled: true } };
