import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';

import { MultiSelect, type MultiSelectOption } from './multiselect.tsx';

const tags: MultiSelectOption[] = [
  { id: 'design', label: 'Design' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'research', label: 'Research' },
  { id: 'sales', label: 'Sales' },
  { id: 'support', label: 'Support' },
];

/** The trigger's text: the caller's summary of what is chosen, derived from the selection. */
const summarize = (selected: Selection): string => {
  const names = tags
    .filter((tag) => selected === 'all' || selected.has(tag.id))
    .map((tag) => tag.label);
  if (names.length === 0) {
    return 'Any tag';
  }
  return names.length <= 2 ? names.join(', ') : `${names.length} tags`;
};

const meta = {
  title: 'Aria/MultiSelect',
  component: MultiSelect,
  args: {
    label: 'Tags',
    summary: 'Any tag',
    searchLabel: 'Search tags',
    noMatchesLabel: 'No tags match',
    clearLabel: 'Clear',
    clearDisabledReason: 'Nothing is chosen',
    options: tags,
    selectedKeys: new Set<string>(),
    onSelectionChange: () => undefined,
  },
  render: function Render(args) {
    // The selection React Aria gives is stored and passed back as it is.
    const [selected, setSelected] = useState<Selection>(args.selectedKeys);
    return (
      <MultiSelect
        {...args}
        selectedKeys={selected}
        summary={summarize(selected)}
        onSelectionChange={setSelected}
      />
    );
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen: Clear, under the list, says why it cannot be pressed. */
export const Empty: Story = {};

/** Something chosen: the summary names it. */
export const WithSelection: Story = {
  args: { selectedKeys: new Set(['design', 'research']) },
};

/** More chosen than the summary names one by one. */
export const ManySelected: Story = {
  args: {
    selectedKeys: new Set(['design', 'engineering', 'sales', 'support']),
  },
};

/** No visible label, as in a toolbar: the field is named by `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Tags' },
};

/** Locked, such as while a write that uses the choice is pending. */
export const Disabled: Story = {
  args: { selectedKeys: new Set(['design']), isDisabled: true },
};
