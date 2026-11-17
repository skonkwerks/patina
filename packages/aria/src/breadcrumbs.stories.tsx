import type { Meta, StoryObj } from '@storybook/react-vite';

import { Breadcrumb, BreadcrumbLink, Breadcrumbs } from './breadcrumbs.tsx';

const meta = {
  title: 'Aria/Breadcrumbs',
  component: Breadcrumbs,
  args: { 'aria-label': 'Breadcrumbs' },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The last crumb is the current page: muted and not a link. */
export const Default: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <Breadcrumb>
        <BreadcrumbLink href='#'>Workspace</BreadcrumbLink>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbLink href='#'>Projects</BreadcrumbLink>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbLink>Spring launch</BreadcrumbLink>
      </Breadcrumb>
    </Breadcrumbs>
  ),
};

export const TwoLevels: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <Breadcrumb>
        <BreadcrumbLink href='#'>Settings</BreadcrumbLink>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbLink>Members</BreadcrumbLink>
      </Breadcrumb>
    </Breadcrumbs>
  ),
};

/** Long names wrap onto further lines instead of overflowing a narrow place. */
export const Wrapping: Story = {
  render: (args) => (
    <div className='max-w-72'>
      <Breadcrumbs {...args}>
        <Breadcrumb>
          <BreadcrumbLink href='#'>Workspace</BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbLink href='#'>Quarterly planning documents</BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbLink href='#'>Engineering</BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbLink>Infrastructure budget review</BreadcrumbLink>
        </Breadcrumb>
      </Breadcrumbs>
    </div>
  ),
};
