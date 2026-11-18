import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import {
  contrastRatio,
  edgeColor,
  NON_TEXT_CONTRAST,
} from '../../internal/contrast.testing.js';
import { ColorSwatch } from './index.js';

const meta = {
  title: 'Aria/ColorSwatch',
  component: ColorSwatch,
  args: { color: '#1e66f5' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** React Aria names the swatch for its color in words, so the color is not told by its look alone. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img')).toHaveAccessibleName(/blue/);
  },
};

/** A translucent color stands over a checkerboard, so its transparency shows. */
export const Translucent: Story = { args: { color: '#1e66f580' } };

/** Fully transparent: React Aria names it "transparent". */
export const Transparent: Story = {
  args: { color: '#00000000' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img')).toHaveAccessibleName('transparent');
  },
};

/**
 * `colorName` gives the color its own name in place of the description, and `aria-label` adds what
 * it is for.
 */
export const Named: Story = {
  args: { colorName: 'Ocean', 'aria-label': 'Background' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      'Ocean, Background',
    );
  },
};

/** The control scale: `sm` 28px, `md` 32px (the default), `lg` 36px. */
export const Sizes: Story = {
  render: (args) => (
    <div className='flex items-center gap-3'>
      <ColorSwatch {...args} size='sm' />
      <ColorSwatch {...args} size='md' />
      <ColorSwatch {...args} size='lg' />
    </div>
  ),
};

/**
 * White and black keep their extent on a surface of either theme by the swatch's inner edge, which
 * reaches 3:1 against the surface in the light and the dark mode.
 */
export const WhiteAndBlack: Story = {
  render: () => (
    <div className='flex flex-col gap-2'>
      {(['light', 'dark'] as const).map((mode) => (
        <div
          key={mode}
          data-mode={mode}
          className={`${mode === 'dark' ? 'dark' : ''} bg-surface flex gap-3 p-4`}
        >
          <ColorSwatch color='#ffffff' />
          <ColorSwatch color='#000000' />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const surfaces = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-mode]'),
    ];
    await expect(surfaces).toHaveLength(2);
    for (const surface of surfaces) {
      const layer = getComputedStyle(surface).backgroundColor;
      const swatches = [
        ...surface.querySelectorAll<HTMLElement>('[role="img"]'),
      ];
      await expect(swatches).toHaveLength(2);
      for (const swatch of swatches) {
        await expect(
          contrastRatio(edgeColor(swatch), layer),
          `${String(surface.dataset.mode)}: ${String(swatch.getAttribute('aria-label'))}`,
        ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
      }
    }
  },
};
