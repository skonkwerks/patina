import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorWheel,
} from './index.js';

const meta = {
  title: 'Aria/ColorPicker',
  component: ColorPicker,
  args: { label: 'Fill', hexFieldLabel: 'Hex', defaultValue: '#1e66f5' },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The trigger says the color in words and in hex. It opens a popover with a saturation and
 * brightness area, a hue slider and a hex field; Escape closes it and gives the focus back to the
 * trigger, which now shows the color chosen.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: /^Fill .*blue #1E66F5$/,
    });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await page.findByRole('dialog', { name: 'Fill' });

    // The area's horizontal channel is the first stop in the popover.
    await userEvent.tab();
    const [saturation] = within(dialog).getAllByRole('slider', {
      name: 'Color picker',
    });
    await expect(saturation).toHaveFocus();
    await userEvent.keyboard('{Home}');

    await userEvent.tab();
    await expect(
      within(dialog).getByRole('slider', { name: 'Hue' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(dialog).getByRole('textbox', { name: 'Hex' }),
    ).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
    await expect(trigger).not.toHaveAccessibleName(/#1E66F5/);
  },
};

/** Its own content: a palette to choose from, and a hex field for any other color. */
export const WithSwatches: Story = {
  args: {
    hexFieldLabel: undefined,
    children: (
      <>
        <ColorSwatchPicker aria-label='Palette' className='w-48'>
          <ColorSwatchPickerItem color='#d20f39' colorName='Cherry' />
          <ColorSwatchPickerItem color='#fe640b' colorName='Tangerine' />
          <ColorSwatchPickerItem color='#df8e1d' colorName='Honey' />
          <ColorSwatchPickerItem color='#40a02b' colorName='Fern' />
          <ColorSwatchPickerItem color='#179299' colorName='Lagoon' />
          <ColorSwatchPickerItem color='#1e66f5' colorName='Ocean' />
          <ColorSwatchPickerItem color='#8839ef' colorName='Violet' />
        </ColorSwatchPicker>
        <ColorField label='Hex' className='w-48' />
      </>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Fill / });

    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: 'Fill' });
    await userEvent.click(within(dialog).getByRole('option', { name: 'Fern' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveAccessibleName(/#40A02B$/);
  },
};

/** A hue wheel around a saturation and brightness area. */
export const WithWheel: Story = {
  args: {
    hexFieldLabel: undefined,
    children: (
      <>
        <div className='relative'>
          <ColorWheel />
          {/* React Aria positions the area itself (relative), so a wrapper centers it. */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
            <ColorArea
              colorSpace='hsb'
              xChannel='saturation'
              yChannel='brightness'
              className='w-24'
            />
          </div>
        </div>
        <ColorField label='Hex' className='w-48' />
      </>
    ),
  },
};

/** One slider per channel, with the alpha. */
export const ChannelSliders: Story = {
  args: {
    hexFieldLabel: undefined,
    defaultValue: 'rgba(30, 102, 245, 0.8)',
    children: (
      <>
        <ColorSlider
          colorSpace='rgb'
          channel='red'
          hasValueOutput
          className='w-48'
        />
        <ColorSlider
          colorSpace='rgb'
          channel='green'
          hasValueOutput
          className='w-48'
        />
        <ColorSlider
          colorSpace='rgb'
          channel='blue'
          hasValueOutput
          className='w-48'
        />
        <ColorSlider
          colorSpace='rgb'
          channel='alpha'
          hasValueOutput
          className='w-48'
        />
      </>
    ),
  },
};

/**
 * A translucent color: the trigger's swatch shows its checkerboard, and the hex its alpha. The
 * popover holds an alpha slider, because a hex typed in the hex field makes the color opaque: the
 * slider shows that, and sets the alpha again.
 */
export const Translucent: Story = {
  args: {
    defaultValue: '#1e66f580',
    hexFieldLabel: undefined,
    children: (
      <>
        <ColorArea
          colorSpace='hsb'
          xChannel='saturation'
          yChannel='brightness'
        />
        <ColorSlider colorSpace='hsb' channel='hue' className='w-48' />
        <ColorSlider colorSpace='hsb' channel='alpha' className='w-48' />
        <ColorField label='Hex' className='w-48' />
      </>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Fill .*#1E66F580$/ });

    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: 'Fill' });
    const alpha = within(dialog).getByRole('slider', { name: 'Alpha' });
    const hex = within(dialog).getByRole('textbox', { name: 'Hex' });

    // The alpha slider steps the alpha, and the trigger's hex says it.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(alpha).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(trigger).toHaveAccessibleName(/#1E66F500$/);

    // A hex typed in the field makes the color opaque, and the alpha slider shows it.
    await userEvent.tab();
    await expect(hex).toHaveFocus();
    await userEvent.clear(hex);
    await userEvent.type(hex, '1e66f6{Enter}');
    await expect(trigger).toHaveAccessibleName(/#1E66F6$/);
    await expect(alpha).toHaveValue('1');

    // The alpha slider sets the alpha again.
    await userEvent.tab({ shift: true });
    await expect(alpha).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await expect(trigger).toHaveAccessibleName(/#1E66F6E6$/);
  },
};

/** No visible label, as in a toolbar: the picker carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Fill' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /^Fill .*#1E66F5$/ }),
    ).toBeInTheDocument();
  },
};

/** Locked, such as while a write that uses the color is pending: the trigger does not open. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /^Fill / })).toBeDisabled();
  },
};
