import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FilePickerButton } from '../../composites/filepicker/index.js';
import { readDroppedFiles } from '../../internal/droppedfiles.js';
import { DropTarget } from './index.js';

const meta = {
  title: 'Aria/DropTarget',
  component: DropTarget,
  args: { 'aria-label': 'Drop a cover image' },
} satisfies Meta<typeof DropTarget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A cover image that takes a dropped file, with its own button to choose one instead. */
const CoverDrop = ({ isDisabled = false }: { isDisabled?: boolean }) => {
  const [name, setName] = useState<string>();
  return (
    <DropTarget
      aria-label='Drop a cover image'
      isDisabled={isDisabled}
      getDropOperation={() => 'copy'}
      onDrop={(event) => {
        void readDroppedFiles(event.items, false).then((read) => {
          if ('files' in read) {
            setName(read.files[0]?.name);
          }
        });
      }}
      className='inline-flex'
    >
      <div className='bg-surface border-surface-border flex w-64 flex-col items-center gap-3 rounded-lg border p-4'>
        <div className='bg-neutral text-neutral-foreground flex h-24 w-full items-center justify-center rounded-md text-sm'>
          {name ?? 'No cover'}
        </div>
        <FilePickerButton
          label='Choose cover'
          size='sm'
          allowsMultiple={false}
          isDisabled={isDisabled}
          acceptedFileTypes={['image/*']}
          onFiles={(files) => setName(files[0]?.name)}
        />
      </div>
    </DropTarget>
  );
};

/** Drop an image on the card: an outline shows while a drag is over it. */
export const Default: Story = {
  render: () => <CoverDrop />,
};

export const Disabled: Story = {
  render: () => <CoverDrop isDisabled />,
};
