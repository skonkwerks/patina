import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSearch, IconX } from '@tabler/icons-react';

import { IconButton } from '../iconbutton/index.ts';
import { Button } from './index.ts';

const variants = ['solid', 'outline', 'ghost', 'link'] as const;
const tones = ['neutral', 'primary', 'destructive'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Aria/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'select', options: variants },
    tone: { control: 'select', options: tones },
    size: { control: 'select', options: sizes },
    radius: { control: 'select', options: ['md', 'full'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default: outline, neutral, medium (32px). */
export const Default: Story = {};

export const Primary: Story = { args: { variant: 'solid', tone: 'primary' } };

export const Destructive: Story = {
  args: { variant: 'solid', tone: 'destructive', children: 'Delete' },
};

/** Every variant in every tone, at the default size, for comparing them in each theme. */
export const VariantsAndTones: Story = {
  render: (args) => (
    <div className='grid grid-cols-[auto_repeat(3,auto)] items-center justify-start gap-x-4 gap-y-3'>
      <span />
      {tones.map((tone) => (
        <span
          key={tone}
          className='text-canvas-foreground-muted text-xs font-medium'
        >
          {tone}
        </span>
      ))}
      {variants.map((variant) => (
        <div key={variant} className='contents'>
          <span className='text-canvas-foreground-muted text-xs font-medium'>
            {variant}
          </span>
          {tones.map((tone) => (
            <div key={tone}>
              <Button {...args} variant={variant} tone={tone}>
                {tone === 'destructive' ? 'Delete' : 'Save changes'}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** The one control scale: `sm` 28px, `md` 32px (the default), `lg` 36px. */
export const Sizes: Story = {
  render: (args) => (
    <div className='flex flex-wrap items-center gap-3'>
      {sizes.map((size) => (
        <Button key={size} {...args} variant='solid' tone='primary' size={size}>
          Size {size}
        </Button>
      ))}
    </div>
  ),
};

/**
 * A button that shows only an icon is an `IconButton`, which takes the same look props: square by
 * default, a circle with `radius='full'`, in each size, here outlined and solid to sit beside text
 * buttons. See Aria/IconButton for its default ghost look.
 */
export const BesideIconButtons: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      {(['md', 'full'] as const).map((radius) => (
        <div key={radius} className='flex items-center gap-3'>
          {sizes.map((size) => (
            <IconButton
              key={size}
              aria-label='Search'
              variant='outline'
              size={size}
              radius={radius}
            >
              <IconSearch aria-hidden className='size-4' />
            </IconButton>
          ))}
          <IconButton
            aria-label='Search'
            variant='solid'
            tone='primary'
            radius={radius}
          >
            <IconSearch aria-hidden className='size-4' />
          </IconButton>
          <Button radius={radius}>Search</Button>
        </div>
      ))}
    </div>
  ),
};

/** A round, ghost close button on a surface: no fill until hovered. */
export const CloseOnSurface: Story = {
  render: () => (
    <div className='bg-surface text-surface-foreground flex w-80 items-start justify-between gap-3 rounded-lg border p-4'>
      <div>
        <p className='text-sm font-medium'>Export ready</p>
        <p className='text-surface-foreground-muted text-xs'>
          Your report has finished exporting.
        </p>
      </div>
      <IconButton aria-label='Close' size='sm' radius='full'>
        <IconX aria-hidden className='size-4' />
      </IconButton>
    </div>
  ),
};

/** Pending: a spinner leads the label, presses are ignored, and the look stays full. */
export const Pending: Story = {
  args: { variant: 'solid', tone: 'primary', isPending: true },
};

/** Disabled with nothing to say: dimmed and skipped by Tab. */
export const Disabled: Story = {
  args: { variant: 'solid', tone: 'primary', isDisabled: true },
};

/** Disabled with a reason: stays focusable and says why on hover and focus. */
export const DisabledWithReason: Story = {
  args: {
    variant: 'solid',
    tone: 'primary',
    disabledReason: 'Fill in a name before saving.',
  },
};

/** A short hint on hover and focus while the button can be pressed. */
export const WithTooltip: Story = {
  args: { tooltip: 'Saves a draft; nothing is published yet.' },
};

/** A link-styled button inside a line of text: it takes the text's size and weight. */
export const InlineLink: Story = {
  render: () => (
    <p className='text-canvas-foreground text-sm'>
      The import failed.{' '}
      <Button variant='link' tone='destructive'>
        See what went wrong
      </Button>{' '}
      or{' '}
      <Button variant='link' tone='primary'>
        try again
      </Button>
      .
    </p>
  ),
};
