import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  type Color,
  type ColorChannel,
  type ColorSpace,
  parseColor,
} from 'react-aria-components';
import { expect } from 'storybook/test';

import { ColorSlider, ColorSwatch } from './index.ts';

const meta = {
  title: 'Aria/ColorSlider',
  component: ColorSlider,
  args: {
    channel: 'hue',
    colorSpace: 'hsl',
    defaultValue: 'hsl(210, 80%, 50%)',
  },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The hue, labeled by React Aria's name of the channel. The arrow keys step it by one degree, Shift
 * with an arrow key and Page Up or Page Down by 15, and Home goes to the start; its value is said
 * in words, with the name of the hue.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('Hue')).toBeVisible();
    const hue = canvas.getByRole('slider', { name: 'Hue' });

    await userEvent.tab();
    await expect(hue).toHaveFocus();
    await expect(hue).toHaveAttribute('aria-valuetext', '210°, cyan blue');

    await userEvent.keyboard('{ArrowRight}');
    await expect(hue).toHaveValue('211');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(hue).toHaveValue('226');
    await userEvent.keyboard('{PageDown}');
    await expect(hue).toHaveValue('211');
    await userEvent.keyboard('{Home}');
    await expect(hue).toHaveValue('0');
    await expect(hue).toHaveAttribute('aria-valuetext', '0°, red');
  },
};

/** `hasValueOutput` shows the channel's value at the end of the label row. */
export const WithValueOutput: Story = { args: { hasValueOutput: true } };

/** A label of the caller's own, in place of the channel's name. */
export const WithLabel: Story = {
  args: { label: 'Fill hue', hasValueOutput: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('slider', { name: 'Fill hue' }),
    ).toBeInTheDocument();
  },
};

/** The alpha channel, over a checkerboard that shows where the color is translucent. */
export const Alpha: Story = {
  args: {
    channel: 'alpha',
    defaultValue: 'hsla(210, 80%, 50%, 0.6)',
    hasValueOutput: true,
  },
};

/** No visible label, as in a toolbar: the slider carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { 'aria-label': 'Fill hue' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Hue')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('slider', { name: 'Fill hue' }),
    ).toBeInTheDocument();
  },
};

/** Disabled: the track and its thumb fade together; the label keeps its contrast, as Slider's does. */
export const Disabled: Story = {
  args: { isDisabled: true, hasValueOutput: true },
};

/** Upright, beside a color area or in a narrow column. */
export const Vertical: Story = {
  args: { orientation: 'vertical', hasValueOutput: true },
};

type ChannelSlidersProps = {
  colorSpace: ColorSpace;
  channels: readonly ColorChannel[];
  initial: string;
};

/** One slider per channel of a color space, all on one color, with a swatch of it. */
const ChannelSliders = ({
  colorSpace,
  channels,
  initial,
}: ChannelSlidersProps) => {
  const [color, setColor] = useState<Color>(() => parseColor(initial));
  return (
    <div className='flex flex-col gap-4'>
      {channels.map((channel) => (
        <ColorSlider
          key={channel}
          colorSpace={colorSpace}
          channel={channel}
          value={color}
          onChange={setColor}
          hasValueOutput
        />
      ))}
      <ColorSwatch color={color} />
    </div>
  );
};

/** Red, green and blue, each from 0 to 255. */
export const RgbChannels: Story = {
  render: () => (
    <ChannelSliders
      colorSpace='rgb'
      channels={['red', 'green', 'blue', 'alpha']}
      initial='rgb(30, 102, 245)'
    />
  ),
};

/** Hue, saturation and lightness. */
export const HslChannels: Story = {
  render: () => (
    <ChannelSliders
      colorSpace='hsl'
      channels={['hue', 'saturation', 'lightness', 'alpha']}
      initial='hsl(220, 91%, 54%)'
    />
  ),
};

/** Hue, saturation and brightness; moving one channel moves the others' gradients with it. */
export const HsbChannels: Story = {
  render: () => (
    <ChannelSliders
      colorSpace='hsb'
      channels={['hue', 'saturation', 'brightness', 'alpha']}
      initial='hsb(220, 88%, 96%)'
    />
  ),
  play: async ({ canvas, userEvent }) => {
    const saturation = canvas.getByRole('slider', { name: 'Saturation' });
    const brightness = canvas.getByRole('slider', { name: 'Brightness' });
    await userEvent.tab();
    await userEvent.tab();
    await expect(saturation).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(saturation).toHaveValue('100');
    // The other sliders hold the same color, so brightness keeps its value.
    await expect(brightness).toHaveValue('96');
  },
};
