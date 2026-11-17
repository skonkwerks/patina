import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button.tsx';
import { Tab, TabList, TabPanel, Tabs } from './tabs.tsx';

const meta = {
  title: 'Aria/Tabs',
  component: Tabs,
  args: {},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Panels = () => (
  <>
    <TabPanel id='overview'>
      <p className='text-canvas-foreground text-sm'>
        A summary of the project: its owner, its status and recent activity.
      </p>
    </TabPanel>
    <TabPanel id='files'>
      <p className='text-canvas-foreground text-sm'>
        Every file in the project.
      </p>
    </TabPanel>
    <TabPanel id='settings'>
      <p className='text-canvas-foreground text-sm'>
        Who can see the project and what they can change.
      </p>
    </TabPanel>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label='Project'>
        <Tab id='overview'>Overview</Tab>
        <Tab id='files'>Files</Tab>
        <Tab id='settings'>Settings</Tab>
      </TabList>
      <Panels />
    </Tabs>
  ),
};

export const SecondSelected: Story = {
  ...Default,
  args: { defaultSelectedKey: 'files' },
};

/** A tab that cannot be chosen now is muted and skipped by the arrow keys. */
export const DisabledTab: Story = {
  ...Default,
  args: { disabledKeys: ['settings'] },
};

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div className='flex items-center gap-3'>
      <Button onPress={() => setCount((value) => value + 1)}>Add one</Button>
      <span className='text-canvas-foreground text-sm'>Count: {count}</span>
    </div>
  );
};

/** A panel kept mounted (`shouldForceMount`) keeps its state while another tab is shown. */
export const KeepsPanelState: Story = {
  render: (args) => {
    return (
      <Tabs {...args}>
        <TabList aria-label='Counter'>
          <Tab id='counter'>Counter</Tab>
          <Tab id='other'>Other</Tab>
        </TabList>
        <TabPanel id='counter' shouldForceMount>
          <Counter />
        </TabPanel>
        <TabPanel id='other'>
          <p className='text-canvas-foreground text-sm'>
            Go back: the count is still there.
          </p>
        </TabPanel>
      </Tabs>
    );
  },
};
