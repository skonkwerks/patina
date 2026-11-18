import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.ts';
import { ThemeMode, type ThemeModeValue } from './index.ts';

/** The theme mode with the mode held in the story, as the app holds it; `onModeChange` records each mode applied. */
const Cycling = ({
  onModeChange,
}: {
  onModeChange: (mode: ThemeModeValue) => void;
}) => {
  const [mode, setMode] = useState<ThemeModeValue>('system');
  return (
    <ThemeMode
      aria-label='Theme'
      mode={mode}
      onModeChange={(next) => {
        setMode(next);
        onModeChange(next);
      }}
      systemLabel='System'
      lightLabel='Light'
      darkLabel='Dark'
    />
  );
};

const meta = {
  title: 'Composites/ThemeMode',
  component: Cycling,
  args: { onModeChange: fn() },
} satisfies Meta<typeof Cycling>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Each press moves to the next mode: system, light, dark, then system again. The name stays
 * "Theme"; the mode in use is the button's description.
 */
export const CyclesByPress: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const theme = canvas.getByRole('button', { name: 'Theme' });
    await expect(theme).toHaveAccessibleDescription('System');
    await userEvent.click(theme);
    await expect(args.onModeChange).toHaveBeenLastCalledWith('light');
    await expect(theme).toHaveAccessibleDescription('Light');
    await userEvent.click(theme);
    await expect(theme).toHaveAccessibleDescription('Dark');
    await userEvent.click(theme);
    await expect(args.onModeChange).toHaveBeenLastCalledWith('system');
    await expect(theme).toHaveAccessibleName('Theme');
    await expect(theme).toHaveAccessibleDescription('System');
  },
};

/**
 * From the keyboard it is one Tab stop: Tab reaches it and shows its name as a tooltip, Enter or
 * Space moves to the next mode, and Tab leaves.
 */
export const CyclesByKeyboard: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    pressTab(document);
    const theme = canvas.getByRole('button', { name: 'Theme' });
    await expect(theme).toHaveFocus();
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Theme');
    await userEvent.keyboard('{Enter}');
    await expect(args.onModeChange).toHaveBeenLastCalledWith('light');
    await userEvent.keyboard(' ');
    await expect(args.onModeChange).toHaveBeenLastCalledWith('dark');
    await expect(theme).toHaveAccessibleDescription('Dark');
    pressTab(document);
    await expect(theme).not.toHaveFocus();
  },
};
