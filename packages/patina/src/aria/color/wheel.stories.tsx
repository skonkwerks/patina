import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { expect } from 'storybook/test';

import { ColorArea, ColorWheel } from './index.js';

const meta = {
  title: 'Aria/ColorWheel',
  component: ColorWheel,
  args: { defaultValue: 'hsl(210, 80%, 50%)' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The hue on a circle, named "Hue" by React Aria. The arrow keys step it by one degree; Shift with
 * an arrow key, Page Up and Page Down move it to the next multiple of 15°. Its value is said in
 * words, with the name of the hue.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const hue = canvas.getByRole('slider', { name: 'Hue' });

    await userEvent.tab();
    await expect(hue).toHaveFocus();
    await expect(hue).toHaveAttribute('aria-valuetext', '210°, cyan blue');

    await userEvent.keyboard('{ArrowRight}');
    await expect(hue).toHaveValue('211');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(hue).toHaveValue('225');
    await userEvent.keyboard('{PageDown}');
    await expect(hue).toHaveValue('210');
  },
};

/** `aria-label` says what the hue is for. */
export const WithLabel: Story = {
  args: { 'aria-label': 'Fill hue' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('slider', { name: 'Fill hue' }),
    ).toBeInTheDocument();
  },
};

/** Disabled: the track and its thumb fade together. */
export const Disabled: Story = { args: { isDisabled: true } };

/**
 * In a column that stretches its children, as a picker's popover does, the wheel keeps its own
 * size: its two edges lie on its track's bounds, centered on it.
 */
export const InAColumn: Story = {
  render: (args) => (
    <div className='flex w-80 flex-col gap-2'>
      <ColorWheel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('.react-aria-ColorWheelTrack');
    const [outer, inner] = canvasElement.querySelectorAll('[aria-hidden]');
    if (track === null || outer === undefined || inner === undefined) {
      throw new Error('The wheel renders no track or no edges.');
    }
    const bounds = track.getBoundingClientRect();
    const outerBounds = outer.getBoundingClientRect();
    const innerBounds = inner.getBoundingClientRect();
    await expect(outerBounds.width).toBe(bounds.width);
    await expect(outerBounds.left).toBe(bounds.left);
    // Forced colors would drop the edges' box shadows. A story can import only Storybook's test
    // API, which has no way to emulate forced colors, so the opt-out is asserted by its class.
    await expect(outer).toHaveClass('forced-color-adjust-none');
    await expect(inner).toHaveClass('forced-color-adjust-none');
    await expect(innerBounds.left + innerBounds.width / 2).toBe(
      bounds.left + bounds.width / 2,
    );
    await expect(innerBounds.top + innerBounds.height / 2).toBe(
      bounds.top + bounds.height / 2,
    );
  },
};

/** A wheel around an area of saturation and brightness, both on one color. */
export const WithArea: Story = {
  render: function Render() {
    const [color, setColor] = useState<Color>(() =>
      parseColor('hsb(210, 60%, 80%)'),
    );
    return (
      <div className='relative'>
        <ColorWheel value={color} onChange={setColor} />
        {/* React Aria positions the area itself (relative), so a wrapper centers it. */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <ColorArea
            colorSpace='hsb'
            xChannel='saturation'
            yChannel='brightness'
            value={color}
            onChange={setColor}
            className='w-24'
          />
        </div>
      </div>
    );
  },
};
