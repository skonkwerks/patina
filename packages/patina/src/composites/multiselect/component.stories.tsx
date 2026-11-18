import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import {
  contrastRatio,
  NON_TEXT_CONTRAST,
} from '../../internal/contrast.testing.js';
import { MultiSelect, type MultiSelectOption } from './index.js';

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
  title: 'Composites/MultiSelect',
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

/** The checkbox drawn at an option's start. */
const checkOf = (option: HTMLElement): HTMLElement => {
  const box = option.firstElementChild;
  if (!(box instanceof HTMLElement)) {
    throw new Error('The option has no checkbox.');
  }
  return box;
};

/** What an element is drawn on: its own background, or the first opaque one around it. */
const backgroundOf = (element: HTMLElement): string => {
  const color = getComputedStyle(element).backgroundColor;
  if (color !== 'rgba(0, 0, 0, 0)' || element.parentElement === null) {
    return color;
  }
  return backgroundOf(element.parentElement);
};

/** The unchecked box's edge against the option it stands on, the non-text contrast it needs. */
const edgeContrast = (option: HTMLElement) =>
  contrastRatio(
    getComputedStyle(checkOf(option)).borderTopColor,
    backgroundOf(option),
  );

/**
 * Every option shows its checkbox while unchecked, so the list reads as a multiple choice before
 * anything is chosen: the box's edge reaches 3:1 against the option, plain and when the option has
 * the focus (its `overlay-hover` fill, the hardest one), and the box fills when the option is chosen.
 */
export const CheckboxesShowUnchecked: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Tags/ }),
    );
    const design = await page.findByRole('option', { name: 'Design' });
    const research = page.getByRole('option', { name: 'Research' });
    await expect(edgeContrast(research)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST,
    );
    // The option fills only while it has the focus: React Aria moves the focus on hover only when
    // the list asks for it, so the focus is given directly.
    design.focus();
    await waitFor(() => expect(design).toHaveAttribute('data-focused', 'true'));
    await expect(backgroundOf(design)).not.toBe(backgroundOf(research));
    await expect(edgeContrast(design)).toBeGreaterThanOrEqual(
      NON_TEXT_CONTRAST,
    );
    await expect(getComputedStyle(checkOf(design)).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
    await userEvent.click(design);
    await expect(design).toHaveAttribute('aria-selected', 'true');
    await expect(getComputedStyle(checkOf(design)).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  },
};
