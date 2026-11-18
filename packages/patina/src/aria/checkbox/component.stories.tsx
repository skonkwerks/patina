import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';

import { Header } from '../../header/index.js';
import { Checkbox, CheckboxGroup } from './index.js';

const meta = {
  title: 'Aria/Checkbox',
  component: Checkbox,
  args: { children: 'Email me a weekly summary' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { defaultSelected: true } };

/** A description under the label, indented to line up with it. */
export const WithDescription: Story = {
  args: { description: 'Sent every Monday morning.' },
};

const channels = [
  { id: 'email', name: 'Email' },
  { id: 'sms', name: 'Text message' },
  { id: 'push', name: 'Push notification' },
] as const;

/** The heading's text, which is also the group's name: one value, so the two always agree. */
const NOTIFICATIONS = 'Notifications';

const SelectAllChannels = () => {
  const [chosen, setChosen] = useState<string[]>(['email']);
  const all = channels.map(({ id }) => id);
  return (
    <div className='flex flex-col gap-3'>
      <Header variant='section' title={NOTIFICATIONS} />
      <Checkbox
        isSelected={chosen.length === all.length}
        isIndeterminate={chosen.length > 0 && chosen.length < all.length}
        onChange={(isSelected) => {
          setChosen(isSelected ? all : []);
        }}
      >
        All notifications
      </Checkbox>
      {/* Under the heading that names it, so it takes the heading's text as its name. */}
      <CheckboxGroup
        aria-label={NOTIFICATIONS}
        value={chosen}
        onChange={setChosen}
      >
        {channels.map(({ id, name }) => (
          <Checkbox key={id} value={id}>
            {name}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
};

/**
 * A select-all over a group: checked when every box under it is, unchecked when none is, and
 * indeterminate (filled, with a dash; mixed to assistive technology) when only some are. React Aria
 * leaves the indeterminate state to the app (`isIndeterminate` is presentational only): the app
 * works it out from the group, as here, so a press on the select-all checks every box, or clears
 * them all once all are checked, and the state follows.
 */
export const SelectAll: Story = {
  render: () => <SelectAllChannels />,
  play: async ({ canvas, userEvent }) => {
    const box = (name: string) =>
      canvas.getByRole<HTMLInputElement>('checkbox', { name });
    const all = box('All notifications');
    // The select-all's glyph: the one icon in its label.
    const glyph = () => {
      const icon = all.closest('label')?.querySelector('svg');
      if (!icon) {
        throw new Error('The select-all draws no glyph.');
      }
      return {
        isDash: icon.classList.contains('tabler-icon-minus'),
        isShown: getComputedStyle(icon).opacity === '1',
      };
    };

    // Only Email is checked: the select-all is indeterminate and shows its dash.
    await expect(all.indeterminate).toBe(true);
    await expect(glyph()).toEqual({ isDash: true, isShown: true });

    // A press checks every box, and the select-all is checked.
    await userEvent.click(all);
    for (const name of ['Email', 'Text message', 'Push notification']) {
      await expect(box(name)).toBeChecked();
    }
    await expect(all).toBeChecked();
    await expect(all.indeterminate).toBe(false);
    await expect(glyph()).toEqual({ isDash: false, isShown: true });

    // Another press clears them all.
    await userEvent.click(all);
    for (const name of ['Email', 'Text message', 'Push notification']) {
      await expect(box(name)).not.toBeChecked();
    }
    await expect(all).not.toBeChecked();
    await expect(glyph().isShown).toBe(false);

    // Checking one box makes the select-all indeterminate again.
    await userEvent.click(box('Text message'));
    await expect(all.indeterminate).toBe(true);
    await expect(glyph()).toEqual({ isDash: true, isShown: true });
  },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const DisabledSelected: Story = {
  args: { isDisabled: true, defaultSelected: true },
};

export const Required: Story = {
  args: { children: 'I agree to the terms', isRequired: true },
};

/** Invalid: the error stands under the label, as a field's does, such as a required box left unchecked. */
export const WithError: Story = {
  args: {
    children: 'I agree to the terms',
    isRequired: true,
    errorMessage: 'Agree to the terms to continue.',
  },
};

/** Controlled from outside: the parent holds the value. */
export const Controlled: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState(false);
    return (
      <div className='flex flex-col gap-2'>
        <Checkbox {...args} isSelected={selected} onChange={setSelected} />
        <p className='text-surface-foreground-muted text-xs'>
          {selected ? 'Checked' : 'Not checked'}
        </p>
      </div>
    );
  },
};

/** A labeled group whose value is the list of checked values. */
export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label='Notifications'
      description='Choose where we reach you.'
      defaultValue={['email']}
    >
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
      <Checkbox value='push' description='On devices where you are signed in.'>
        Push notification
      </Checkbox>
    </CheckboxGroup>
  ),
};

/** A group with a caller's error: marked invalid and the message shows under it. */
export const GroupWithError: Story = {
  render: () => (
    <CheckboxGroup
      label='Notifications'
      errorMessage='Choose at least one way to reach you.'
    >
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
    </CheckboxGroup>
  ),
};

export const GroupDisabled: Story = {
  render: () => (
    <CheckboxGroup label='Notifications' isDisabled defaultValue={['sms']}>
      <Checkbox value='email'>Email</Checkbox>
      <Checkbox value='sms'>Text message</Checkbox>
    </CheckboxGroup>
  ),
};
