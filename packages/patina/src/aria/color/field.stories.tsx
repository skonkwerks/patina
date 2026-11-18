import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.ts';
import { Button } from '../button/index.ts';
import { Form } from '../form/index.ts';
import {
  ColorField,
  ColorPicker,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
} from './index.ts';

/** What the stories say of a color too light for white text on it. */
const TOO_LIGHT = 'Choose a darker color, so white text on it stays readable.';

const meta = {
  title: 'Aria/ColorField',
  component: ColorField,
  args: { label: 'Color', defaultValue: '#1e66f5' },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A hex value. Typed text is read when the field commits, on Enter or when it is left, and written
 * back in full; text that is not a color gives way to the last valid color.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Color' });

    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.clear(field);
    await userEvent.type(field, 'f00{Enter}');
    await expect(field).toHaveValue('#FF0000');

    // The arrow keys step the value.
    await userEvent.keyboard('{ArrowUp}');
    await expect(field).toHaveValue('#FF0001');

    // Text that is not a color is not kept: the field keeps the last valid one.
    await userEvent.clear(field);
    await userEvent.type(field, '12{Enter}');
    await expect(field).toHaveValue('#FF0001');
  },
};

export const WithDescription: Story = {
  args: { description: 'Shown behind the title on the cover.' },
};

/** An example value as the placeholder of an empty field. */
export const Empty: Story = {
  args: { defaultValue: undefined, placeholder: '#1E66F5' },
};

/** A caller's error: the field is marked invalid and the message shows under it. */
export const WithError: Story = {
  args: {
    defaultValue: '#eeeeee',
    errorMessage: TOO_LIGHT,
  },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Color' });
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription(TOO_LIGHT);
  },
};

/**
 * Required, in a form: submitting it empty shows the field's error and moves the focus to it, and a
 * color typed in clears the error once the field is left.
 */
export const RequiredInForm: Story = {
  render: (args) => (
    <Form onSubmit={() => undefined}>
      <ColorField {...args} name='color' isRequired />
      <Button type='submit' className='self-start'>
        Save
      </Button>
    </Form>
  ),
  args: { defaultValue: undefined },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Color' });

    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-invalid', 'true');

    await userEvent.type(field, '1e66f5');
    await userEvent.tab();
    await expect(field).not.toHaveAttribute('aria-invalid');
    await expect(field).toHaveValue('#1E66F5');
  },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const ReadOnly: Story = { args: { isReadOnly: true } };

/** No visible label, as in a toolbar: the field carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Fill color' },
};

/**
 * One channel as a number. Without a label (here, as in a toolbar), React Aria names the field for
 * its channel. The arrow keys step the channel.
 */
export const Channel: Story = {
  args: {
    label: undefined,
    colorSpace: 'hsl',
    channel: 'hue',
    defaultValue: 'hsl(210, 80%, 50%)',
  },
  play: async ({ canvas, userEvent }) => {
    const hue = canvas.getByRole('textbox', { name: 'Hue' });
    await userEvent.tab();
    await expect(hue).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(hue).toHaveValue('211°');
  },
};

const channels = [
  { channel: 'red', label: 'Red' },
  { channel: 'green', label: 'Green' },
  { channel: 'blue', label: 'Blue' },
] as const;

/** One field per channel of a color space, all on one color, with a swatch of it. */
export const RgbChannels: Story = {
  render: function Render() {
    const [color, setColor] = useState<Color | null>(() =>
      parseColor('#1e66f5'),
    );
    return (
      <div className='flex items-end gap-2'>
        {channels.map(({ channel, label }) => (
          <ColorField
            key={channel}
            label={label}
            colorSpace='rgb'
            channel={channel}
            value={color}
            onChange={setColor}
            className='w-16'
          />
        ))}
        {color && <ColorSwatch color={color} />}
      </div>
    );
  },
};

/** Refuses a color too light for white text on it. */
const refuseLight = (color: Color | null) =>
  color !== null && color.toFormat('hsl').getChannelValue('lightness') > 70
    ? TOO_LIGHT
    : null;

/**
 * Inside a `ColorPicker`, the field's shown error follows the color the picker's other controls set:
 * a light hex shows the error, and choosing a dark swatch clears it without leaving the field.
 */
export const ErrorFollowsThePicker: Story = {
  render: () => (
    <ColorPicker label='Fill' defaultValue='#1e66f5'>
      <ColorSwatchPicker aria-label='Palette' className='w-48'>
        <ColorSwatchPickerItem color='#1e66f5' colorName='Ocean' />
        <ColorSwatchPickerItem color='#40a02b' colorName='Fern' />
      </ColorSwatchPicker>
      <ColorField label='Hex' validate={refuseLight} className='w-48' />
    </ColorPicker>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /^Fill / }));
    const dialog = await page.findByRole('dialog', { name: 'Fill' });
    const hex = within(dialog).getByRole('textbox', { name: 'Hex' });

    await userEvent.clear(hex);
    await userEvent.type(hex, 'eeeeee{Enter}');
    await expect(hex).toHaveAttribute('aria-invalid', 'true');
    await expect(within(dialog).getByText(TOO_LIGHT)).toBeVisible();

    // Leaving the field for the swatch list (Tab goes round inside the popover) commits it again,
    // and the light color keeps the error.
    pressTab(canvasElement.ownerDocument);
    const palette = within(dialog).getByRole('listbox', { name: 'Palette' });
    await expect(
      palette.contains(canvasElement.ownerDocument.activeElement),
    ).toBe(true);
    await expect(hex).toHaveAttribute('aria-invalid', 'true');

    // A dark swatch chosen from the list, the field untouched, clears the error.
    await userEvent.keyboard('{End}{Enter}');
    await expect(hex).toHaveValue('#40A02B');
    await expect(hex).not.toHaveAttribute('aria-invalid');
    await expect(within(dialog).queryByText(TOO_LIGHT)).not.toBeInTheDocument();
  },
};
