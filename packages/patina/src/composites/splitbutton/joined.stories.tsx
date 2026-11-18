import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Menu, MenuItem } from '../../aria/menu/index.js';
import { SplitButton } from './index.js';

const menu = (
  <Menu aria-label='Run count'>
    <MenuItem id='once'>Run once</MenuItem>
  </Menu>
);

/** Every look a split button has: both sizes, with the chevron and with a value in the menu part. */
const Looks = () => (
  <div className='flex flex-col items-start gap-4'>
    <SplitButton menu={menu} menuLabel='Run count'>
      Run
    </SplitButton>
    <SplitButton menu={menu} menuLabel='Run count: 3' menuContent='3×'>
      Run
    </SplitButton>
    <SplitButton size='sm' menu={menu} menuLabel='Run count'>
      Run
    </SplitButton>
    <SplitButton
      size='sm'
      menu={menu}
      menuLabel='Run count: 3'
      menuContent='3×'
    >
      Run
    </SplitButton>
  </div>
);

const meta = {
  title: 'Composites/Joined SplitButton',
  component: Looks,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Looks>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * In every look the two parts read as one control: continuous along the top and bottom, square
 * where they meet, with the thin divider between them and no gap.
 */
export const EveryLook: Story = {
  play: async ({ canvas }) => {
    const actions = canvas.getAllByRole('button', { name: 'Run' });
    await expect(actions).toHaveLength(4);
    for (const action of actions) {
      const menuPart = action.nextElementSibling;
      if (!(menuPart instanceof HTMLElement)) {
        throw new Error('The menu part stands right after the action.');
      }
      const actionStyle = getComputedStyle(action);
      const menuStyle = getComputedStyle(menuPart);
      await expect(actionStyle.borderStartEndRadius).toBe('0px');
      await expect(actionStyle.borderEndEndRadius).toBe('0px');
      await expect(menuStyle.borderStartStartRadius).toBe('0px');
      await expect(menuStyle.borderEndStartRadius).toBe('0px');
      await expect(menuStyle.borderInlineStartWidth).toBe('1px');
      await expect(menuPart.getBoundingClientRect().left).toBe(
        action.getBoundingClientRect().right,
      );
    }
  },
};
