import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ListBox as AriaListBox,
  Menu as AriaMenu,
} from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { ListBox, ListBoxItem } from '../aria/listbox/index.js';
import { MenuItem, menuStyles } from '../aria/menu/index.js';
import { contrastRatio, NON_TEXT_CONTRAST } from './contrast.testing.js';
import { pressTab } from './keyboard.testing.js';

const fruits = ['Apple', 'Banana', 'Cherry'];

/**
 * The three ways an option is drawn, each on the layer it stands on: a menu's items (a `Menu`'s, a
 * command palette's) and a popover list's options (a `Select`'s, a `ComboBox`'s, a
 * `MultiSelect`'s) on the overlay, and a standalone `ListBox`'s options on the surface. The two
 * overlay lists stand in a cell of the overlay's color rather than in a popover, so that both modes
 * of the theme can be shown at once, the dark one inside `.dark`.
 */
const Lists = ({ mode }: { mode: 'light' | 'dark' }) => (
  <div className={`${mode === 'dark' ? 'dark' : ''} grid grid-cols-3 gap-2`}>
    <div data-layer={`${mode} menu`} className='bg-overlay rounded-md p-1'>
      <AriaMenu aria-label={`Actions ${mode}`} className={menuStyles().menu()}>
        {fruits.map((fruit) => (
          <MenuItem key={fruit} id={fruit}>
            {fruit}
          </MenuItem>
        ))}
      </AriaMenu>
    </div>
    <div
      data-layer={`${mode} popover list`}
      className='bg-overlay rounded-md p-1'
    >
      <AriaListBox aria-label={`Fruit ${mode}`} className='outline-0'>
        {fruits.map((fruit) => (
          <ListBoxItem key={fruit} id={fruit}>
            {fruit}
          </ListBoxItem>
        ))}
      </AriaListBox>
    </div>
    <div data-layer={`${mode} list`} className='bg-surface rounded-md'>
      <ListBox aria-label={`Fruit on the page ${mode}`}>
        {fruits.map((fruit) => (
          <ListBoxItem key={fruit} id={fruit}>
            {fruit}
          </ListBoxItem>
        ))}
      </ListBox>
    </div>
  </div>
);

const OptionFocusRing = () => (
  <div className='flex flex-col gap-4'>
    <Lists mode='light' />
    <Lists mode='dark' />
  </div>
);

const meta = {
  title: 'Contract/Option focus ring',
  component: OptionFocusRing,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OptionFocusRing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The option in a cell that holds the keyboard's focus. */
const keyboardFocusedOption = (cell: HTMLElement) => {
  const option = cell.querySelector<HTMLElement>(
    '[role="option"][data-focus-visible], [role="menuitem"][data-focus-visible]',
  );
  if (option === null) {
    const focused = cell.ownerDocument.activeElement;
    throw new Error(
      `No option holds the keyboard's focus: ${cell.dataset.layer}; the focus is on ${focused?.outerHTML.slice(0, 160)}`,
    );
  }
  return option;
};

/**
 * The option that holds the keyboard's focus carries the focus ring, 2px inside its edge, and the
 * ring reaches 3:1 against the option's focused fill and against the layer around the option, in
 * both modes of the theme: the contrast a focus indicator needs. The fill alone does not: it is a
 * soft tint of the layer.
 */
export const ReachesThreeToOne: Story = {
  play: async ({ canvasElement }) => {
    const cells = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-layer]'),
    ];
    await expect(cells).toHaveLength(6);
    for (const cell of cells) {
      // Each list is one Tab stop; entering it puts the focus on its first option, which React
      // Aria marks once it has drawn the option again.
      pressTab(canvasElement.ownerDocument);
      const option = await waitFor(() => keyboardFocusedOption(cell));
      const label = `${cell.dataset.layer}: ${option.textContent}`;
      const style = getComputedStyle(option);
      await expect(style.outlineStyle, label).toBe('solid');
      await expect(style.outlineWidth, label).toBe('2px');
      await expect(style.outlineOffset, label).toBe('-2px');
      await expect(
        contrastRatio(style.outlineColor, style.backgroundColor),
        `${label}, against the option's fill`,
      ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
      await expect(
        contrastRatio(
          style.outlineColor,
          getComputedStyle(cell).backgroundColor,
        ),
        `${label}, against the layer`,
      ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
    }
  },
};

/**
 * Under the pointer the option keeps only its soft fill: once the pointer has pressed, as it does to
 * open a menu, a menu's item takes the focus as the pointer moves over it, but the focus is not the
 * keyboard's, so no ring is drawn.
 */
export const PointerShowsTheFillAlone: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const cell = canvasElement.querySelector<HTMLElement>(
      '[data-layer="light menu"]',
    );
    if (cell === null) {
      throw new Error('The light menu is missing');
    }
    await userEvent.click(
      within(cell).getByRole('menuitem', { name: 'Apple' }),
    );
    const banana = within(cell).getByRole('menuitem', { name: 'Banana' });
    await userEvent.hover(banana);
    await waitFor(async () => {
      await expect(banana).toHaveAttribute('data-focused', 'true');
    });
    await expect(banana).not.toHaveAttribute('data-focus-visible');
    const style = getComputedStyle(banana);
    await expect(style.outlineWidth).toBe('0px');
    await expect(style.backgroundColor).not.toBe(
      getComputedStyle(cell).backgroundColor,
    );
  },
};
