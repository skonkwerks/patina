import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.js';
import { DemoSidebar } from './demo.testing.js';

const meta = {
  title: 'Composites/Sidebar',
  component: DemoSidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className='flex h-[32rem]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The sidebar open: the brand, two groups (Projects current, Jobs at work, Nodes failed), and the
 * footer with a status, the theme mode and the collapse toggle. The current item is the page;
 * Jobs is the current section while a job's page is open.
 */
export const Open: Story = {
  args: { initialRoute: '/jobs/42' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Jobs, Working' }),
    ).toHaveAttribute('aria-current', 'location');
    await expect(
      canvas.getByRole('link', { name: 'Nodes, Failed' }),
    ).not.toHaveAttribute('aria-current');
  },
};

/** The current page's item is announced as the current page. */
export const CurrentItem: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Projects (2)' }),
    ).toHaveAttribute('aria-current', 'page');
  },
};

/**
 * The collapsed rail: the mark, the items' icons (Nodes with its alert dot), and the footer as a
 * column, where the theme mode steps aside.
 */
export const Collapsed: Story = {
  args: { isInitiallyCollapsed: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('button', { name: 'Theme' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Expand sidebar' }),
    ).toBeInTheDocument();
  },
};

/** The toggle collapses the sidebar to the rail and expands it again, saying which it is. */
export const CollapseToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const nav = canvas.getByRole('navigation', { name: 'Main' });
    const collapse = canvas.getByRole('button', { name: 'Collapse sidebar' });
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await expect(collapse).toHaveAttribute('aria-controls', nav.id);
    await userEvent.click(collapse);
    const expand = canvas.getByRole('button', { name: 'Expand sidebar' });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    // The rail is 3.5rem wide once its transition has run.
    await waitFor(() =>
      expect(nav.getBoundingClientRect().width).toBeLessThanOrEqual(56),
    );
    await userEvent.click(expand);
    await waitFor(() =>
      expect(nav.getBoundingClientRect().width).toBeGreaterThanOrEqual(224),
    );
  },
};

/** On the rail an item's name is hidden and shows as its tooltip when the keyboard reaches it. */
export const RailTooltipOnFocus: Story = {
  args: { isInitiallyCollapsed: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const projects = canvas.getByRole('link', { name: 'Projects (2)' });
    // Past the header's mark to the first item.
    await userEvent.tab();
    await userEvent.tab();
    await expect(projects).toHaveFocus();
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
    );
    await expect(tooltip).toHaveTextContent('Projects (2)');
  },
};

/**
 * The keyboard goes from the header into the items once (they are one Tab stop: the arrow keys move
 * between them, and Shift+Tab leaves them for the header), then to the theme mode and on to the
 * collapse toggle.
 */
export const TabOrder: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    pressTab(document);
    await expect(canvas.getByRole('link', { name: 'Studio' })).toHaveFocus();
    pressTab(document);
    await expect(
      canvas.getByRole('link', { name: 'Projects (2)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const jobs = canvas.getByRole('link', { name: 'Jobs, Working' });
    await expect(jobs).toHaveFocus();
    // Shift+Tab leaves the items for the header, and Tab comes back into them.
    const studio = canvas.getByRole('link', { name: 'Studio' });
    pressTab(document, { isShift: true });
    await expect(studio).toHaveFocus();
    pressTab(document);
    // The focus enters the tree, and React Aria moves it on to the item it left from.
    await waitFor(() => expect(jobs).toHaveFocus());
    pressTab(document);
    const theme = canvas.getByRole('button', { name: 'Theme' });
    await expect(theme).toHaveFocus();
    pressTab(document);
    await expect(
      canvas.getByRole('button', { name: 'Collapse sidebar' }),
    ).toHaveFocus();
    pressTab(document, { isShift: true });
    await expect(theme).toHaveFocus();
  },
};
