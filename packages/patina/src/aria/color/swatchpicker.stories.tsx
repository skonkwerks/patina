import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { ColorSwatchPicker, ColorSwatchPickerItem } from './index.js';

/** A palette whose colors have names of their own. */
const palette = [
  { color: '#d20f39', name: 'Cherry' },
  { color: '#fe640b', name: 'Tangerine' },
  { color: '#df8e1d', name: 'Honey' },
  { color: '#40a02b', name: 'Fern' },
  { color: '#179299', name: 'Lagoon' },
  { color: '#1e66f5', name: 'Ocean' },
  { color: '#8839ef', name: 'Violet' },
] as const;

const meta = {
  title: 'Aria/ColorSwatchPicker',
  component: ColorSwatchPicker,
  args: { 'aria-label': 'Label color', defaultValue: '#1e66f5' },
  parameters: { layout: 'centered' },
  render: (args) => (
    <ColorSwatchPicker {...args}>
      {palette.map(({ color }) => (
        <ColorSwatchPickerItem key={color} color={color} />
      ))}
    </ColorSwatchPicker>
  ),
} satisfies Meta<typeof ColorSwatchPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One Tab stop: the focus lands on the chosen swatch, the arrow keys move between swatches, and
 * Enter chooses one. Each swatch is named for its color in words, and the chosen one is marked by a
 * frame, not by its color.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('listbox', { name: 'Label color' });
    const chosen = within(list).getByRole('option', { selected: true });
    await expect(chosen).toHaveAccessibleName(/blue/);

    await userEvent.tab();
    await expect(chosen).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const next = within(list).getByRole('option', { name: /purple|violet/ });
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(next).toHaveAttribute('aria-selected', 'true');
    await expect(chosen).toHaveAttribute('aria-selected', 'false');
  },
};

/** `colorName` gives each swatch its palette name, read in place of the description. */
export const Named: Story = {
  render: (args) => (
    <ColorSwatchPicker {...args}>
      {palette.map(({ color, name }) => (
        <ColorSwatchPickerItem key={color} color={color} colorName={name} />
      ))}
    </ColorSwatchPicker>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('listbox', { name: 'Label color' });
    await expect(
      within(list).getByRole('option', { selected: true }),
    ).toHaveAccessibleName('Ocean');
    await expect(
      within(list).getByRole('option', { name: 'Cherry' }),
    ).toBeInTheDocument();
  },
};

/** The small swatches, for a toolbar. */
export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

/** A column, where the up and down arrows move between swatches. */
export const Stack: Story = { args: { layout: 'stack' } };

/** A swatch that cannot be chosen is skipped by the arrow keys. */
export const WithDisabledSwatch: Story = {
  render: (args) => (
    <ColorSwatchPicker {...args}>
      {palette.map(({ color }) => (
        <ColorSwatchPickerItem
          key={color}
          color={color}
          isDisabled={color === '#fe640b'}
        />
      ))}
    </ColorSwatchPicker>
  ),
  args: { defaultValue: '#d20f39' },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('listbox', { name: 'Label color' });
    const [cherry, tangerine, honey] = within(list).getAllByRole('option');
    await expect(tangerine).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(cherry).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(honey).toHaveFocus();
  },
};

/** Controlled: the caller holds the chosen color and says it in words beside the list. */
export const Controlled: Story = {
  render: function Render(args) {
    const [color, setColor] = useState<Color>(() => parseColor('#1e66f5'));
    const chosen = palette.find(
      ({ color: value }) =>
        parseColor(value).toString('hex') === color.toString('hex'),
    );
    return (
      <div className='flex flex-col gap-3'>
        <ColorSwatchPicker {...args} value={color} onChange={setColor}>
          {palette.map(({ color: value, name }) => (
            <ColorSwatchPickerItem key={value} color={value} colorName={name} />
          ))}
        </ColorSwatchPicker>
        <p role='status' className='text-canvas-foreground-muted text-sm'>
          {chosen ? `${chosen.name} is chosen` : 'No color is chosen'}
        </p>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('option', { name: 'Fern' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Fern is chosen',
    );
  },
};
