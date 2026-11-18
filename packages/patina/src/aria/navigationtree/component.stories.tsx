import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconDownload, IconInfoCircle, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';

import {
  NavigationTree,
  NavigationTreeHeader,
  NavigationTreeLink,
  NavigationTreeSection,
} from './index.js';

const meta = {
  title: 'Aria/NavigationTree',
  component: NavigationTree,
  args: { 'aria-label': 'Main' },
} satisfies Meta<typeof NavigationTree>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The tree inside a `<nav>`, with a router that only records the route, so pressing a link marks
 * it current without leaving the story.
 */
const Navigation = ({
  initialRoute,
  collapsed = false,
  currentSection,
}: {
  initialRoute: string;
  collapsed?: boolean;
  currentSection?: string;
}) => {
  const [route, setRoute] = useState(initialRoute);
  const name = (text: string) =>
    collapsed ? <span className='sr-only'>{text}</span> : text;
  return (
    <RouterProvider navigate={setRoute}>
      <nav
        aria-label='Main'
        className={`bg-surface border-surface-border rounded-lg border py-2 ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <NavigationTree aria-label='Main' selectedRoute={route}>
          <NavigationTreeSection id='work'>
            <NavigationTreeHeader isHidden={collapsed}>
              Work
            </NavigationTreeHeader>
            <NavigationTreeLink
              id='search'
              href='/search'
              textValue='Search'
              tooltip={collapsed ? 'Search' : undefined}
            >
              <IconSearch aria-hidden className='h-5 w-5 shrink-0' />
              {name('Search')}
            </NavigationTreeLink>
            <NavigationTreeLink
              id='downloads'
              href='/downloads'
              textValue='Downloads'
              isCurrentSection={currentSection === '/downloads'}
              tooltip={collapsed ? 'Downloads' : undefined}
            >
              <IconDownload aria-hidden className='h-5 w-5 shrink-0' />
              {name('Downloads')}
            </NavigationTreeLink>
          </NavigationTreeSection>
          <NavigationTreeSection id='help'>
            <NavigationTreeHeader isHidden={collapsed}>
              Help
            </NavigationTreeHeader>
            <NavigationTreeLink
              id='about'
              href='/about'
              textValue='About'
              tooltip={collapsed ? 'About' : undefined}
            >
              <IconInfoCircle aria-hidden className='h-5 w-5 shrink-0' />
              {name('About')}
            </NavigationTreeLink>
          </NavigationTreeSection>
        </NavigationTree>
      </nav>
    </RouterProvider>
  );
};

/** Press a link: it becomes the current one, with the edge marker. */
export const Default: Story = {
  render: () => <Navigation initialRoute='/search' />,
};

/** The current page is below Downloads (a file's page), so Downloads is marked as the current section. */
export const CurrentSection: Story = {
  render: () => (
    <Navigation initialRoute='/downloads/42' currentSection='/downloads' />
  ),
};

/** The collapsed rail: names and headers are visually hidden, and each link shows its name as a tooltip. */
export const CollapsedRail: Story = {
  render: () => <Navigation initialRoute='/search' collapsed />,
};
