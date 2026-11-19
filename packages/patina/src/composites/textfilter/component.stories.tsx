import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { TextFilter, type TextFilterProps } from './index.js';

const customers = [
  'Northwind Traders',
  'Contoso Pharmaceuticals',
  'Fabrikam',
  'Tailspin Toys',
  'Wingtip Toys',
];

/** Holds the text, as an app does, and counts the customers whose names hold it. */
const HeldFilter = (props: Omit<TextFilterProps, 'value' | 'onChange'>) => {
  const [value, setValue] = useState('');
  const matches = customers.filter((name) =>
    name.toLowerCase().includes(value.toLowerCase()),
  ).length;
  return (
    <TextFilter
      {...props}
      value={value}
      onChange={setValue}
      countText={matches === 1 ? '1 match' : `${matches} matches`}
    />
  );
};

const meta = {
  title: 'Composites/TextFilter',
  component: TextFilter,
  args: {
    label: 'Find customers',
    placeholder: 'Northwind',
    value: '',
    onChange: () => undefined,
  },
} satisfies Meta<typeof TextFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Waits a while, as a person typing might pause for less than the announcement's delay. */
const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** The live region the count is announced in. */
const liveRegionOf = (canvasElement: HTMLElement) => {
  const region = canvasElement.querySelector('[aria-live="polite"]');
  if (region === null) {
    throw new Error('The text filter has no live region.');
  }
  return region;
};

/**
 * Empty, it shows no count. Typed in, the count of matches follows the box as its description, and
 * is announced once the typing pauses. Cleared, the count goes, and a new search is announced only
 * once its own typing pauses, never with the last search's count.
 */
export const Default: Story = {
  render: (args) => <HeldFilter {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const box = canvas.getByRole('searchbox', { name: 'Find customers' });
    await expect(canvas.queryByText(/match/)).toBeNull();

    await userEvent.type(box, 'toy');
    await expect(canvas.getByText('2 matches')).toBeVisible();
    await expect(box).toHaveAccessibleDescription('2 matches');
    // Not announced while the typing may go on (a second on, still nothing); announced once it
    // pauses for two.
    await pause(1000);
    await expect(liveRegionOf(canvasElement)).toBeEmptyDOMElement();
    await waitFor(
      () => expect(liveRegionOf(canvasElement)).toHaveTextContent('2 matches'),
      { timeout: 3000 },
    );

    // A further search with the same count is announced again, as a new node in the region.
    const announced = liveRegionOf(canvasElement).firstElementChild;
    await userEvent.type(box, 's');
    await expect(box).toHaveValue('toys');
    await waitFor(
      async () => {
        const again = liveRegionOf(canvasElement).firstElementChild;
        await expect(again).not.toBe(announced);
        await expect(again).toHaveTextContent('2 matches');
      },
      { timeout: 3000 },
    );

    await userEvent.keyboard('{Escape}');
    await expect(box).toHaveValue('');
    await expect(canvas.queryByText(/match/)).toBeNull();
    await expect(liveRegionOf(canvasElement)).toBeEmptyDOMElement();

    // A new search with another count: nothing is announced until its typing pauses, and never the
    // last search's count.
    await userEvent.type(box, 'f');
    await expect(box).toHaveAccessibleDescription('1 match');
    await expect(liveRegionOf(canvasElement)).toBeEmptyDOMElement();
    await pause(1000);
    await expect(liveRegionOf(canvasElement)).toBeEmptyDOMElement();
    await waitFor(
      () => expect(liveRegionOf(canvasElement)).toHaveTextContent('1 match'),
      { timeout: 3000 },
    );
  },
};
