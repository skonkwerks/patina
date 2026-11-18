import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { expect } from 'storybook/test';

import { ColorArea, ColorSwatch } from './index.ts';

const meta = {
  title: 'Aria/ColorArea',
  component: ColorArea,
  args: {
    colorSpace: 'hsb',
    xChannel: 'saturation',
    yChannel: 'brightness',
    defaultValue: 'hsb(210, 60%, 80%)',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Saturation across and brightness up. The arrow keys step a channel by one, Shift with an arrow key
 * by ten, and Page Up or Page Down step the vertical channel by ten; each value is said in words,
 * with both channels and a description of the color.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // React Aria keeps an input for each channel and shows assistive technology the one in use.
    const [saturation, brightness] = canvasElement.querySelectorAll('input');
    if (saturation === undefined || brightness === undefined) {
      throw new Error('The color area renders no input for each channel.');
    }

    await userEvent.tab();
    await expect(canvas.getByRole('slider')).toBe(saturation);
    await expect(saturation).toHaveFocus();
    await expect(saturation).toHaveAccessibleName('Color picker');
    await expect(saturation).toHaveAttribute(
      'aria-valuetext',
      'Saturation: 60%, Brightness: 80%, Hue: 210°, cyan blue',
    );

    await userEvent.keyboard('{ArrowRight}');
    await expect(saturation).toHaveValue('61');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(saturation).toHaveValue('71');

    await userEvent.keyboard('{ArrowUp}');
    await expect(brightness).toHaveFocus();
    await expect(brightness).toHaveValue('81');
    await expect(brightness).toHaveAttribute(
      'aria-valuetext',
      'Brightness: 81%, cyan blue',
    );
    await userEvent.keyboard('{PageDown}');
    await expect(brightness).toHaveValue('71');
  },
};

/** `aria-label` says what the color is for; React Aria adds that the control picks a color. */
export const WithLabel: Story = {
  args: { 'aria-label': 'Fill' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toHaveAccessibleName(
      'Fill, Color picker',
    );
  },
};

/** Red across and green up. */
export const RgbChannels: Story = {
  args: {
    colorSpace: 'rgb',
    xChannel: 'red',
    yChannel: 'green',
    defaultValue: 'rgb(30, 102, 245)',
  },
};

/** Saturation across and lightness up. */
export const HslChannels: Story = {
  args: {
    colorSpace: 'hsl',
    xChannel: 'saturation',
    yChannel: 'lightness',
    defaultValue: 'hsl(220, 91%, 54%)',
  },
};

/** Wider, set by the caller's `className`; the height follows. */
export const Wide: Story = { args: { className: 'w-64' } };

/** Disabled: the area and its thumb fade together. */
export const Disabled: Story = { args: { isDisabled: true } };

/** Controlled: the caller holds the color and shows it in a swatch. */
export const Controlled: Story = {
  render: function Render(args) {
    const [color, setColor] = useState<Color>(() =>
      parseColor('hsb(210, 60%, 80%)'),
    );
    return (
      <div className='flex items-start gap-4'>
        <ColorArea {...args} value={color} onChange={setColor} />
        <div className='flex flex-col gap-2'>
          <ColorSwatch color={color} size='lg' />
          <p className='text-canvas-foreground-muted text-sm tabular-nums'>
            {color.toString('hex')}
          </p>
        </div>
      </div>
    );
  },
};
