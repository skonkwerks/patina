import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MultiSelect, type MultiSelectOption } from './multiselect.tsx';

const tags: MultiSelectOption[] = [
  { id: 'design', label: 'Design' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'research', label: 'Research' },
  { id: 'sales', label: 'Sales' },
  { id: 'support', label: 'Support' },
];

/** The trigger's text: the caller's summary of what is chosen. */
const summarize = (selected: readonly string[]): string => {
  if (selected.length === 0) {
    return 'Any tag';
  }
  const names = tags
    .filter((tag) => selected.includes(tag.id))
    .map((tag) => tag.label);
  return names.length <= 2 ? names.join(', ') : `${names.length} tags`;
};

const meta = {
  title: 'Aria/MultiSelect',
  component: MultiSelect,
  args: {
    'aria-label': 'Tags',
    summary: 'Any tag',
    searchLabel: 'Search tags',
    noMatchesLabel: 'No tags match',
    clearLabel: 'Clear',
    options: tags,
    selected: [],
    onChange: () => undefined,
  },
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>([...args.selected]);
    return (
      <MultiSelect
        {...args}
        selected={selected}
        summary={summarize(selected)}
        onChange={setSelected}
      />
    );
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** Something chosen: the summary names it, and Clear shows under the list. */
export const WithSelection: Story = {
  args: { selected: ['design', 'research'] },
};

/** More chosen than the summary names one by one. */
export const ManySelected: Story = {
  args: { selected: ['design', 'engineering', 'sales', 'support'] },
};

/** Locked, such as while a write that uses the choice is pending. */
export const Disabled: Story = {
  args: { selected: ['design'], isDisabled: true },
};
