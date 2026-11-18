import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import {
  contrastRatio,
  paintedColor,
  TEXT_CONTRAST,
} from './contrast.testing.js';
import { TRANSPARENT } from './itemstate.testing.js';

/**
 * Every fill and the text drawn on it, as the token contract names them: each text on the fill,
 * and on its hover where the fill has one.
 */
const pairs = [
  { text: 'text-canvas-foreground', fill: 'bg-canvas' },
  { text: 'text-canvas-foreground-muted', fill: 'bg-canvas' },
  { text: 'text-surface-foreground', fill: 'bg-surface' },
  { text: 'text-surface-foreground', fill: 'bg-surface-hover' },
  { text: 'text-surface-foreground-muted', fill: 'bg-surface' },
  { text: 'text-surface-foreground-muted', fill: 'bg-surface-hover' },
  { text: 'text-overlay-foreground', fill: 'bg-overlay' },
  { text: 'text-overlay-foreground', fill: 'bg-overlay-hover' },
  { text: 'text-overlay-foreground-muted', fill: 'bg-overlay' },
  { text: 'text-overlay-foreground-muted', fill: 'bg-overlay-hover' },
  { text: 'text-input-foreground', fill: 'bg-input' },
  { text: 'text-primary-foreground', fill: 'bg-primary' },
  { text: 'text-primary-foreground', fill: 'bg-primary-hover' },
  { text: 'text-neutral-foreground', fill: 'bg-neutral' },
  { text: 'text-neutral-foreground', fill: 'bg-neutral-hover' },
  { text: 'text-destructive-foreground', fill: 'bg-destructive' },
  { text: 'text-destructive-foreground', fill: 'bg-destructive-hover' },
  { text: 'text-info-foreground', fill: 'bg-info' },
  { text: 'text-success-foreground', fill: 'bg-success' },
  { text: 'text-warning-foreground', fill: 'bg-warning' },
  { text: 'text-error-foreground', fill: 'bg-error' },
] as const;

/**
 * A text color no token draws, given to the pairs' wrapper: a cell whose text token the theme lacks
 * inherits it, as computed, instead of a color that might pass.
 */
const UNDRAWN_TEXT = 'rgb(1, 2, 3)';

/** Every pair, in the light mode and, inside `.dark`, in the dark mode. */
const TextOnFills = () => (
  <div className='flex flex-col gap-4' style={{ color: UNDRAWN_TEXT }}>
    {(['light', 'dark'] as const).map((mode) => (
      <div
        key={mode}
        className={`${mode === 'dark' ? 'dark' : ''} grid grid-cols-2 gap-2`}
      >
        {pairs.map(({ text, fill }) => (
          <p
            key={`${text} ${fill}`}
            data-pair={`${mode}: ${text} on ${fill}`}
            className={`${fill} ${text} rounded-md p-3 text-sm`}
          >
            {`${text} on ${fill}`}
          </p>
        ))}
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Contract/Text on fills',
  component: TextOnFills,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextOnFills>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A fill's text, `{name}-foreground` and, on a layer, `{name}-foreground-muted`, reaches 4.5:1 on
 * the fill and, where it has one, on its hover, in both modes of the theme: a layer's text and a
 * status's, and a button's text under the pointer, a hovered row's, a sortable table heading's.
 */
export const ReachesFourAndAHalfToOne: Story = {
  play: async ({ canvasElement }) => {
    const cells = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-pair]'),
    ];
    await expect(cells).toHaveLength(pairs.length * 2);
    for (const cell of cells) {
      const style = getComputedStyle(cell);
      // A token the theme lacks draws nothing: a fill would paint as black, which light text passes
      // against, and a text would inherit the wrapper's. Each fill and each text must draw.
      await expect(style.backgroundColor, cell.dataset.pair).not.toBe(
        TRANSPARENT,
      );
      await expect(style.color, cell.dataset.pair).not.toBe(UNDRAWN_TEXT);
      // Painted first: a theme may give a token as `color-mix()`, which the browser computes as
      // a color function the contrast helper does not read.
      await expect(
        contrastRatio(
          paintedColor(style.color),
          paintedColor(style.backgroundColor),
        ),
        cell.dataset.pair,
      ).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    }
  },
};
