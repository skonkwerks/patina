import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen } from 'storybook/test';

import { Pagination, type PaginationProps } from './index.js';

const meta = {
  title: 'Composites/Pagination',
  component: Pagination,
  args: { 'aria-label': 'Invoice pages', pageCount: 10 },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The pagination's places as text, in order: each page's number, and `…` for each gap. */
const placesOf = (list: HTMLElement) =>
  Array.from(list.children, (item) => item.textContent)
    .filter((text) => text !== '')
    .join(' ');

/** Holds the page, as an app does. */
const HeldPagination = (props: PaginationProps) => {
  const [page, setPage] = useState(props.page ?? 1);
  return <Pagination {...props} page={page} onChange={setPage} />;
};

/**
 * Ten pages, on the first: the first seven, an ellipsis, and the last, as Cloudscape's. The
 * current page is bold and marked. The arrow to the page before cannot be pressed, and says why on
 * hover and focus. A page is chosen by its number or by an arrow, with the pointer or the keyboard.
 */
export const Default: Story = {
  render: (args) => <HeldPagination {...args} />,
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list', { name: 'Invoice pages' });
    await expect(placesOf(list)).toBe('1 2 3 4 5 6 7 … 10');
    const first = canvas.getByRole('button', { name: 'Page 1' });
    await expect(first).toHaveAttribute('aria-current', 'page');
    await expect(getComputedStyle(first).fontWeight).toBe('700');

    // The first page's Previous is disabled by its reason: focusable, and saying why.
    const previous = canvas.getByRole('button', { name: 'Previous page' });
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(previous).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This is the first page',
    );
    await userEvent.keyboard('{Enter}');
    await expect(first).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Page 6' }));
    await expect(placesOf(list)).toBe('1 … 4 5 6 7 8 9 10');
    await expect(
      canvas.getByRole('button', { name: 'Page 6' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(first).not.toHaveAttribute('aria-current');

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(
      canvas.getByRole('button', { name: 'Page 7' }),
    ).toHaveAttribute('aria-current', 'page');

    // From the keyboard: Space on the arrow to the page before.
    canvas.getByRole('button', { name: 'Previous page' }).focus();
    await userEvent.keyboard(' ');
    await expect(
      canvas.getByRole('button', { name: 'Page 6' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};

/** On the last page, the arrow to the page after cannot be pressed, and says why. */
export const LastPage: Story = {
  args: { page: 10 },
  render: (args) => <HeldPagination {...args} />,
  play: async ({ canvas, userEvent }) => {
    await expect(
      placesOf(canvas.getByRole('list', { name: 'Invoice pages' })),
    ).toBe('1 … 4 5 6 7 8 9 10');
    const next = canvas.getByRole('button', { name: 'Next page' });
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    // From the last page's own button, Tab reaches the arrow, which says why on focus.
    await userEvent.click(canvas.getByRole('button', { name: 'Page 10' }));
    await userEvent.tab();
    await expect(next).toHaveFocus();
    await expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This is the last page',
    );
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Page 10' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};

/**
 * With no pages, as for a search that matches nothing: page 1, and neither arrow can be pressed.
 */
export const NoPages: Story = {
  args: { pageCount: 0 },
  play: async ({ canvas }) => {
    await expect(
      placesOf(canvas.getByRole('list', { name: 'Invoice pages' })),
    ).toBe('1');
    await expect(
      canvas.getByRole('button', { name: 'Previous page' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Next page' }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Held by itself from `defaultPage`, telling the app of each page chosen. */
export const Uncontrolled: Story = {
  args: { defaultPage: 3 },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('button', { name: 'Page 3' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(
      canvas.getByRole('button', { name: 'Page 4' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};
