import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';

import { IconCheck, IconInfoCircle } from './icons.tsx';
import { IconToggle, Toggle, ToggleGroup } from './togglegroup.tsx';

const meta = {
  title: 'Aria/ToggleGroup',
  component: ToggleGroup,
  args: {
    'aria-label': 'View',
    defaultSelectedKeys: ['list'],
    children: (
      <>
        <Toggle id='list'>List</Toggle>
        <Toggle id='grid'>Grid</Toggle>
        <Toggle id='board'>Board</Toggle>
      </>
    ),
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single choice: one pressed at a time, never none. */
export const Single: Story = {};

/** Multiple: any number pressed, including none. */
export const Multiple: Story = {
  args: {
    'aria-label': 'Text style',
    selectionMode: 'multiple',
    defaultSelectedKeys: ['bold'],
    children: (
      <>
        <Toggle id='bold'>Bold</Toggle>
        <Toggle id='italic'>Italic</Toggle>
        <Toggle id='underline'>Underline</Toggle>
      </>
    ),
  },
};

export const Disabled: Story = { args: { isDisabled: true } };

/** One segment that cannot be pressed. */
export const DisabledSegment: Story = {
  args: {
    children: (
      <>
        <Toggle id='list'>List</Toggle>
        <Toggle id='grid'>Grid</Toggle>
        <Toggle id='board' isDisabled>
          Board
        </Toggle>
      </>
    ),
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<Set<Key>>(() => new Set(['grid']));
    return (
      <div className='flex flex-col gap-2'>
        <ToggleGroup
          {...args}
          selectedKeys={selected}
          onSelectionChange={setSelected}
        />
        <p className='text-surface-foreground-muted text-xs'>
          Pressed: {[...selected].join(', ') || 'none'}
        </p>
      </div>
    );
  },
};

/** The group sets one size for all its toggles: `sm` 28px, `md` 32px (the default), `lg` 36px. */
export const Sizes: Story = {
  render: (args) => (
    <div className='flex flex-col items-start gap-3'>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ToggleGroup
          key={size}
          {...args}
          aria-label={`View, size `}
          size={size}
        />
      ))}
    </div>
  ),
};

/** Standalone toggles: outline (fills when pressed), ghost, and icon-only. */
export const Standalone: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <Toggle defaultSelected>Pinned</Toggle>
      <Toggle variant='ghost'>Muted</Toggle>
      <IconToggle aria-label='Done' variant='outline' defaultSelected>
        {() => <IconCheck aria-hidden className='size-4' />}
      </IconToggle>
    </div>
  ),
};

/** A standalone ghost toggle that shows only an icon, in two sizes. */
export const IconToggles: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <IconToggle aria-label='Mark as done'>
        {({ isSelected }) =>
          isSelected ? (
            <IconCheck aria-hidden className='text-success size-4' />
          ) : (
            <IconCheck aria-hidden className='size-4 opacity-40' />
          )
        }
      </IconToggle>
      <IconToggle aria-label='Show details' size='sm' defaultSelected>
        {({ isSelected }) => (
          <IconInfoCircle
            aria-hidden
            className={isSelected ? 'text-info h-4 w-4' : 'h-4 w-4 opacity-40'}
          />
        )}
      </IconToggle>
      <IconToggle aria-label='Locked' isDisabled>
        {() => <IconInfoCircle aria-hidden className='size-4' />}
      </IconToggle>
    </div>
  ),
};
