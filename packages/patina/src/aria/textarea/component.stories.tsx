import type { Meta, StoryObj } from '@storybook/react-vite';

import { InfoButton } from '../../composites/infobutton/index.js';
import { Button } from '../button/index.js';
import { TextArea } from './index.js';

const meta = {
  title: 'Aria/TextArea',
  component: TextArea,
  args: { label: 'Description', placeholder: 'What is this project about?' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      'A shared library of React Aria wrappers, themed with Tailwind tokens.',
  },
};

export const WithDescription: Story = {
  args: { description: 'Markdown is supported.' },
};

export const WithError: Story = {
  args: { errorMessage: 'A description is required.' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Locked while saving.' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'Read only text.' },
};

export const FewerRows: Story = { args: { rows: 3 } };

/** An info control beside the label, and actions at the end of the label row. */
export const WithInfoAndLabelActions: Story = {
  args: {
    info: <InfoButton aria-label='About descriptions' />,
    labelActions: (
      <Button variant='link' tone='primary'>
        Use template
      </Button>
    ),
  },
};
