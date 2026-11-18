import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { expect } from 'storybook/test';

import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
} from './index.js';

const meta = {
  title: 'Aria/DisclosureGroup',
  component: DisclosureGroup,
  args: { children: null },
} satisfies Meta<typeof DisclosureGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Sections = () => (
  <>
    <Disclosure id='general'>
      <DisclosureHeader>General</DisclosureHeader>
      <DisclosurePanel>
        <p className='text-canvas-foreground'>
          The project&apos;s name, its description and who owns it.
        </p>
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id='members'>
      <DisclosureHeader>Members</DisclosureHeader>
      <DisclosurePanel>
        <p className='text-canvas-foreground'>
          Who can see the project and what each person can change.
        </p>
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id='retention'>
      <DisclosureHeader>Retention</DisclosureHeader>
      <DisclosurePanel>
        <p className='text-canvas-foreground'>
          How long files are kept after they are deleted.
        </p>
      </DisclosurePanel>
    </Disclosure>
  </>
);

/**
 * One section open at a time: opening one closes the one that was open. Tab moves between the
 * headers; Enter or Space opens and closes the focused one.
 */
export const Default: Story = {
  args: { defaultExpandedKeys: ['general'] },
  render: (args) => (
    <DisclosureGroup {...args} className='max-w-md'>
      <Sections />
    </DisclosureGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const general = canvas.getByRole('button', { name: 'General' });
    const members = canvas.getByRole('button', { name: 'Members' });
    await expect(general).toHaveAttribute('aria-expanded', 'true');
    await expect(members).toHaveAttribute('aria-expanded', 'false');

    await userEvent.tab();
    await expect(general).toHaveFocus();
    await userEvent.tab();
    await expect(members).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(members).toHaveAttribute('aria-expanded', 'true');
    await expect(general).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.getByText(
        'Who can see the project and what each person can change.',
      ),
    ).toBeVisible();

    await userEvent.keyboard(' ');
    await expect(members).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Several sections may stay open at once. */
export const MultipleExpanded: Story = {
  args: { allowsMultipleExpanded: true },
  render: (args) => (
    <DisclosureGroup {...args} className='max-w-md'>
      <Sections />
    </DisclosureGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const general = canvas.getByRole('button', { name: 'General' });
    const retention = canvas.getByRole('button', { name: 'Retention' });
    await userEvent.click(general);
    await userEvent.click(retention);
    await expect(general).toHaveAttribute('aria-expanded', 'true');
    await expect(retention).toHaveAttribute('aria-expanded', 'true');
  },
};

/** The whole group disabled: every header is faded and out of the Tab order. */
export const Disabled: Story = {
  args: { isDisabled: true, defaultExpandedKeys: ['general'] },
  render: (args) => (
    <DisclosureGroup {...args} className='max-w-md'>
      <Sections />
    </DisclosureGroup>
  ),
  play: async ({ canvas }) => {
    for (const name of ['General', 'Members', 'Retention']) {
      const trigger = canvas.getByRole('button', { name });
      await expect(trigger).toBeDisabled();
      await expect(getComputedStyle(trigger).opacity).toBe('0.5');
    }
  },
};

/** Controlled: the parent holds which sections are open. */
export const Controlled: Story = {
  render: function Render(args) {
    const [expanded, setExpanded] = useState<Set<Key>>(
      () => new Set(['members']),
    );
    return (
      <div className='flex max-w-md flex-col gap-3'>
        <DisclosureGroup
          {...args}
          expandedKeys={expanded}
          onExpandedChange={setExpanded}
        >
          <Sections />
        </DisclosureGroup>
        <p className='text-canvas-foreground-muted text-xs'>
          Open: {[...expanded].join(', ') || 'none'}
        </p>
      </div>
    );
  },
};
