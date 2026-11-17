import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { DropFailureReason } from '../../internal/droppedfiles.ts';
import { DropZone, type DropZoneProps } from './index.ts';

const meta = {
  title: 'Composites/DropZone',
  component: DropZone,
  args: {
    title: 'Drop files here',
    description: 'or choose them',
    chooseLabel: 'Choose files',
    onFiles: () => undefined,
    onDropError: () => undefined,
  },
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The zone, and under it the files it received or why a drop gave none. */
const DropZoneWithResult = (args: DropZoneProps) => {
  const [files, setFiles] = useState<string[]>([]);
  const [failure, setFailure] = useState<DropFailureReason>();
  return (
    <div className='flex max-w-md flex-col gap-3'>
      <DropZone
        {...args}
        onFiles={(received) => {
          setFailure(undefined);
          setFiles(received.map((file) => file.name));
        }}
        onDropError={setFailure}
      />
      {failure && (
        <p role='alert' className='text-destructive text-sm'>
          The drop gave no files: {failure}
        </p>
      )}
      {files.length > 0 && (
        <p className='text-canvas-foreground text-sm'>
          Received: {files.join(', ')}
        </p>
      )}
    </div>
  );
};

/** Drop files on the zone or choose them with its button. */
export const Default: Story = {
  render: (args) => <DropZoneWithResult {...args} />,
};

/** Takes one file: a drop of several reports `too-many`. */
export const SingleFile: Story = {
  args: {
    title: 'Drop a file here',
    chooseLabel: 'Choose a file',
    allowsMultiple: false,
  },
  render: (args) => <DropZoneWithResult {...args} />,
};

/** The picker offers images only; a drop is not limited by it. */
export const ImagesOnly: Story = {
  args: {
    title: 'Drop images here',
    chooseLabel: 'Choose images',
    acceptedFileTypes: ['image/*'],
  },
  render: (args) => <DropZoneWithResult {...args} />,
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => <DropZoneWithResult {...args} />,
};
