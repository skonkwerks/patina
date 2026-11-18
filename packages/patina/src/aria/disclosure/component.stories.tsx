import type { Meta, StoryObj } from '@storybook/react-vite';

import { Disclosure, DisclosureHeader, DisclosurePanel } from './index.js';

const meta = {
  title: 'Aria/Disclosure',
  component: Disclosure,
  args: { children: null },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  render: (args) => (
    <Disclosure {...args}>
      <DisclosureHeader>Advanced settings</DisclosureHeader>
      <DisclosurePanel>
        <p className='text-canvas-foreground'>
          Settings most projects never change: the retention period, the default
          region and the webhook secret.
        </p>
      </DisclosurePanel>
    </Disclosure>
  ),
};

export const Expanded: Story = {
  ...Collapsed,
  args: { defaultExpanded: true },
};

export const Disabled: Story = {
  ...Collapsed,
  args: { isDisabled: true },
};

/** A section nested in another, with the next heading level down. */
export const Nested: Story = {
  render: (args) => (
    <Disclosure {...args} defaultExpanded>
      <DisclosureHeader>Billing</DisclosureHeader>
      <DisclosurePanel>
        <p className='text-canvas-foreground'>The plan and how it is paid.</p>
        <Disclosure>
          <DisclosureHeader level={3}>Invoices</DisclosureHeader>
          <DisclosurePanel>
            <p className='text-canvas-foreground'>
              Every invoice from the past year.
            </p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosurePanel>
    </Disclosure>
  ),
};
