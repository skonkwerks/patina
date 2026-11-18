import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Breadcrumb,
  BreadcrumbLink,
  Breadcrumbs,
} from '../aria/breadcrumbs/index.ts';
import { Button } from '../aria/button/index.ts';
import { LinkButton } from '../aria/link/index.ts';
import { LoadFailure } from '../composites/loadstatus/index.ts';
import { Page } from './index.ts';

const trail = (
  <Breadcrumbs aria-label='Breadcrumbs'>
    <Breadcrumb>
      <BreadcrumbLink href='#'>Home</BreadcrumbLink>
    </Breadcrumb>
    <Breadcrumb>
      <BreadcrumbLink>Projects</BreadcrumbLink>
    </Breadcrumb>
  </Breadcrumbs>
);

const rows = Array.from(
  { length: 30 },
  (_, index) => `Project ${String(index + 1)}`,
);

const meta = {
  title: 'Core/Page',
  component: Page,
  args: {
    breadcrumbs: trail,
    title: 'Projects',
    description: 'Everything the team is working on.',
    actions: (
      <Button variant='solid' tone='primary'>
        New project
      </Button>
    ),
    children: (
      <ul className='text-canvas-foreground flex flex-col gap-2 text-sm'>
        {rows.slice(0, 8).map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    ),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default workbench: the trail, the heading, then the content at the full width. */
export const Workbench: Story = {};

/** A notice under the heading about the page itself, such as a failed refresh, which stays on screen. */
export const WithNotice: Story = {
  args: {
    notice: (
      <LoadFailure
        message='The list could not be refreshed. It shows what was read before.'
        retryLabel='Retry'
        onRetry={() => undefined}
      />
    ),
  },
};

/**
 * A workbench that fills the window's height: the heading stays, and the last child (a list here)
 * scrolls inside itself.
 */
export const Fill: Story = {
  args: {
    fill: true,
    children: (
      // A region that scrolls on its own takes the focus, so the keyboard can scroll it.
      <ul
        aria-label='Projects'
        tabIndex={0}
        className='border-surface-border text-surface-foreground min-h-0 flex-1 overflow-y-auto rounded-lg border text-sm'
      >
        {rows.map((row) => (
          <li key={row} className='border-surface-border border-b px-4 py-2'>
            {row}
          </li>
        ))}
      </ul>
    ),
  },
  decorators: [
    (Story) => (
      <div className='h-[32rem]'>
        <Story />
      </div>
    ),
  ],
};

/** The welcome layout: a centered narrow column, such as the page an unknown address shows. */
export const Welcome: Story = {
  args: {
    layout: 'welcome',
    title: 'Nothing here',
    description: 'This address does not lead to a page.',
    actions: undefined,
    children: <LinkButton href='#'>Go to Home</LinkButton>,
  },
};
