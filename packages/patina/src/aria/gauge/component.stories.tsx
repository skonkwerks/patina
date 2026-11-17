import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCpu } from '@tabler/icons-react';

import { Gauge } from './index.ts';

const meta = {
  title: 'Aria/Gauge',
  component: Gauge,
  args: { label: 'GPU', value: 42, tone: 'info' },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A visible label under the ring, which is also the meter's name. */
export const Default: Story = {};

/** The five tones side by side. The caller chooses the tone; the gauge never derives it. */
export const Tones: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Gauge label='Idle' value={12} tone='neutral' />
      <Gauge label='Load' value={42} tone='info' />
      <Gauge label='Healthy' value={65} tone='success' />
      <Gauge label='Busy' value={84} tone='warning' />
      <Gauge label='Full' value={97} tone='error' />
    </div>
  ),
};

/** `valueLabel` says the value in words to assistive technology; the ring still shows the percentage. */
export const ValueInWords: Story = {
  args: {
    label: 'VRAM',
    value: 16,
    valueLabel: '15.3 of 95.6 GiB',
    tone: 'success',
  },
};

/** No value: an empty ring and a dash, and assistive technology hears `valueLabel`. */
export const NotObserved: Story = {
  args: { label: 'GPU', value: undefined, valueLabel: 'Not reported' },
};

/** No visible label: the name comes from `aria-label`; an icon stands in for the number. */
export const WithIcon: Story = {
  args: {
    label: undefined,
    'aria-label': 'CPU load',
    value: 58,
    tone: 'warning',
    icon: <IconCpu aria-hidden />,
  },
};
