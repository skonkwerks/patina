import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Meter } from './index.ts';

const meta = {
  title: 'Aria/Meter',
  component: Meter,
  // A meter takes the width its place gives it; `className` sets one here.
  args: { label: 'Storage', value: 62, tone: 'info', className: 'w-72' },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The fill element of the one meter in the story. */
const fillOf = (meter: HTMLElement) => {
  const fill = meter.querySelector('[style]');
  if (!(fill instanceof HTMLElement)) {
    throw new Error('The meter draws no fill.');
  }
  return fill;
};

/**
 * A visible label, which is also the meter's name, and the value at the end of its row. The bar is
 * filled to the value, and assistive technology hears the same value text the row shows.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Storage' });
    await expect(meter).toHaveAttribute('aria-valuenow', '62');
    await expect(meter).toHaveAttribute('aria-valuetext', '62%');
    await expect(meter).toHaveTextContent('62%');
    await expect(fillOf(meter).style.width).toBe('62%');
  },
};

/**
 * The five tones. The caller chooses the tone; the meter never derives it from the value, and says
 * in words what a warning or an error tone means, so color is not the only signal.
 */
export const Tones: Story = {
  render: () => (
    <div className='flex w-72 flex-col gap-4'>
      <Meter label='Archive' value={12} tone='neutral' />
      <Meter label='Storage' value={42} tone='info' />
      <Meter label='Memory' value={55} tone='success' />
      <Meter
        label='Disk'
        value={84}
        valueLabel='84%, nearly full'
        tone='warning'
      />
      <Meter label='Quota' value={97} valueLabel='97%, full' tone='error' />
    </div>
  ),
};

/** `valueLabel` gives the value in words: the row shows it, and assistive technology hears it. */
export const ValueInWords: Story = {
  args: {
    label: 'Video memory',
    value: 16,
    valueLabel: '15.3 of 95.6 GiB',
    tone: 'success',
  },
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Video memory' });
    await expect(meter).toHaveAttribute('aria-valuetext', '15.3 of 95.6 GiB');
    await expect(meter).toHaveTextContent('15.3 of 95.6 GiB');
    await expect(fillOf(meter).style.width).toBe('16%');
  },
};

/** A custom range shown in a unit: 3.2 of 8 hours, filled to 40%. */
export const CustomRange: Story = {
  args: {
    label: 'Build minutes today',
    minValue: 0,
    maxValue: 8,
    value: 3.2,
    formatOptions: { style: 'unit', unit: 'hour', maximumFractionDigits: 1 },
    tone: 'neutral',
  },
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Build minutes today' });
    await expect(meter).toHaveAttribute('aria-valuemax', '8');
    await expect(fillOf(meter).style.width).toBe('40%');
  },
};

/** No visible label: the name comes from `aria-label`, and the row holds the value alone. */
export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Upload quota', value: 91 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('meter', { name: 'Upload quota' }),
    ).toHaveAttribute('aria-valuenow', '91');
  },
};
