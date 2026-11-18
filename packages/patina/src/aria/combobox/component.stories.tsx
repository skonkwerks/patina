import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { pressTab } from '../../internal/keyboard.testing.ts';
import { Button } from '../button/index.ts';
import { Form } from '../form/index.ts';
import { ListBoxItem, ListBoxSection } from '../listbox/index.ts';
import { ComboBox, type ComboBoxProps } from './index.ts';

type Option = { id: string; name: string; isDisabled?: boolean };

const regions: Option[] = [
  { id: 'us-east', name: 'US East' },
  { id: 'us-west', name: 'US West' },
  { id: 'eu-central', name: 'EU Central' },
  { id: 'eu-west', name: 'EU West' },
  { id: 'ap-south', name: 'Asia Pacific South' },
];

type Group = { id: string; name: string; options: Option[] };

const produce: Group[] = [
  {
    id: 'fruit',
    name: 'Fruit',
    options: [
      'Apple',
      'Banana',
      'Cantaloupe',
      'Grapes',
      'Honeydew',
      'Orange',
      'Pear',
      'Watermelon',
    ].map((name) => ({ id: name.toLowerCase(), name })),
  },
  {
    id: 'vegetable',
    name: 'Vegetable',
    options: [
      'Bok choy',
      'Broccoli',
      'Cabbage',
      'Carrots',
      'Cauliflower',
      'Lettuce',
      'Potatoes',
      'Spinach',
    ].map((name) => ({ id: name.toLowerCase().replace(' ', ''), name })),
  },
];

const regionItem = (item: Option) => (
  <ListBoxItem id={item.id} isDisabled={item.isDisabled}>
    {item.name}
  </ListBoxItem>
);

const meta = {
  title: 'Aria/ComboBox',
  component: ComboBox<Option>,
  args: {
    label: 'Region',
    placeholder: 'EU Central',
    noMatchesLabel: 'No regions match',
    defaultItems: regions,
    children: regionItem,
  },
  decorators: [
    (Story) => (
      <div className='w-64'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ComboBoxProps<Option>>;

export default meta;
type Story = StoryObj<ComboBoxProps<Option>>;

/**
 * The play context. The props' pending union keeps Storybook from inferring it for a story, so
 * each play function names it.
 */
type Context = StoryContext;

/** The page's body, where the popover's list is rendered. */
const pageOf = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body);

/**
 * The arrow keys open the list on the first option; typing narrows it to the options that contain
 * the text; Enter chooses the focused option and closes the list. The input keeps the focus
 * throughout, and Escape closes the list without choosing. The option the arrow keys reach is the
 * keyboard's, so it carries the focus ring (`Contract/Option focus ring`).
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const page = pageOf(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Region' });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    const listBox = await page.findByRole('listbox');
    const first = within(listBox).getByRole('option', { name: 'US East' });
    await expect(input).toHaveAttribute('aria-activedescendant', first.id);
    await expect(first).toHaveAttribute('data-focus-visible', 'true');

    // Escape closes the list; nothing is chosen and the input keeps the focus.
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    });
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();

    // Typing opens the list, narrowed to what matches.
    await userEvent.keyboard('eu');
    const filtered = await page.findByRole('listbox');
    await expect(
      within(filtered)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['EU Central', 'EU West']);

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    });
    await expect(input).toHaveValue('EU West');
    await expect(input).toHaveFocus();
  },
};

/** A chosen region: the input shows its name, and the open list marks it with a check. */
export const WithValue: Story = {
  args: { defaultValue: 'eu-central' },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await expect(input).toHaveValue('EU Central');
    await userEvent.click(canvas.getByRole('button', { name: /Region/ }));
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(
      within(listBox).getByRole('option', { name: 'EU Central' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const WithDescription: Story = {
  args: { description: 'Where your data is stored.' },
};

/** A caller's error: the field is invalid, and the error stands under it. */
export const WithError: Story = {
  args: { errorMessage: 'Choose a region where your plan is offered.' },
  play: async ({ canvas }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Choose a region where your plan is offered.',
    );
  },
};

/**
 * A required combo box in a form. Submitting with nothing chosen shows React Aria's error and moves
 * the focus to the field; choosing a region clears the error at once, while the input keeps the
 * focus, not only when the field is left. The field is one Tab stop: Tab skips the chevron.
 */
export const Required: Story = {
  args: { isRequired: true, name: 'region' },
  render: (args: ComboBoxProps<Option>) => (
    <Form onSubmit={() => undefined} className='items-start'>
      <ComboBox {...args} />
      <Button type='submit'>Create</Button>
    </Form>
  ),
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const page = pageOf(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Region' });

    await userEvent.click(canvas.getByRole('button', { name: 'Create' }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await page.findByRole('listbox');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('US East');
    await expect(input).toHaveFocus();
    await waitFor(async () => {
      await expect(input).not.toHaveAttribute('aria-invalid');
    });

    // One Tab stop: the chevron is not one, so Tab goes on to Create.
    pressTab(canvasElement.ownerDocument);
    await expect(canvas.getByRole('button', { name: 'Create' })).toHaveFocus();
  },
};

/** Disabled: the input takes no text and the chevron opens nothing. */
export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'us-east' },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Region' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: /Region/ }));
    await expect(
      pageOf(canvasElement).queryByRole('listbox'),
    ).not.toBeInTheDocument();
  },
};

/** One option that cannot be chosen: drawn disabled, and passed over by the arrow keys. */
export const DisabledItem: Story = {
  args: {
    defaultItems: regions.map((region) =>
      region.id === 'us-west' ? { ...region, isDisabled: true } : region,
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      within(listBox).getByRole('option', { name: 'EU Central' }).id,
    );
  },
};

/** While the typed text matches nothing, the list stays open and says so (`noMatchesLabel`). */
export const NoMatches: Story = {
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Region' }));
    await userEvent.keyboard('mars');
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(listBox).toHaveTextContent('No regions match');
    await expect(
      within(listBox).queryByRole('option', { name: 'US East' }),
    ).not.toBeInTheDocument();
  },
};

/**
 * Options in titled groups, longer than the list's height. The list scrolls inside the popover:
 * opening it with the up arrow focuses the last option, which is scrolled into view.
 */
export const Sections: Story = {
  render: () => (
    <ComboBox<Group>
      label='Produce'
      noMatchesLabel='No produce matches'
      defaultItems={produce}
    >
      {(group) => (
        <ListBoxSection id={group.id} title={group.name} items={group.options}>
          {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
        </ListBoxSection>
      )}
    </ComboBox>
  ),
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Produce' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(
      within(listBox).getByRole('group', { name: 'Vegetable' }),
    ).toBeVisible();
    const last = within(listBox).getByRole('option', { name: 'Spinach' });
    await expect(input).toHaveAttribute('aria-activedescendant', last.id);
    await waitFor(async () => {
      await expect(listBox.scrollTop).toBeGreaterThan(0);
    });
  },
};

/**
 * Several regions: the list stays open while options are chosen, each chosen one checked, and the
 * line under the field lists them.
 */
export const Multiple: Story = {
  render: (args: ComboBoxProps<Option>) => (
    <ComboBox<Option, 'multiple'>
      label={args.label}
      noMatchesLabel={args.noMatchesLabel}
      defaultItems={regions}
      selectionMode='multiple'
      valuePlaceholder='No regions chosen'
    >
      {regionItem}
    </ComboBox>
  ),
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const page = pageOf(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await expect(input).toHaveAccessibleDescription('No regions chosen');

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    const listBox = await page.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    // Every option shows a checkbox (the one bordered box in an option), chosen or not.
    await expect(
      listBox.querySelectorAll('span[class~="border"]'),
    ).toHaveLength(regions.length);
    await expect(
      within(listBox).getByRole('option', { name: 'US East' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(listBox).getByRole('option', { name: 'EU Central' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(input).toHaveAccessibleDescription('US East and EU Central');

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    });
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('US East and EU Central');
  },
};

/**
 * While the regions are read, the spinner and its words stand at the end of the label row, on the
 * label's line, and describe the input after its description, which stays drawn under the label.
 * An empty list says the same, not that nothing matches.
 */
export const Pending: Story = {
  args: {
    isPending: true,
    pendingText: 'Loading regions…',
    description: 'Where your data is stored.',
    defaultItems: [],
  },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await expect(input).toHaveAccessibleDescription(
      'Where your data is stored. Loading regions…',
    );
    await expect(canvas.getByText('Where your data is stored.')).toBeVisible();
    const words = canvas.getByText('Loading regions…');
    const label = canvas.getByText('Region');
    const middle = (element: Element) => {
      const box = element.getBoundingClientRect();
      return (box.top + box.bottom) / 2;
    };
    await expect(Math.abs(middle(words) - middle(label))).toBeLessThanOrEqual(
      1,
    );

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(listBox).toHaveTextContent('Loading regions…');
    await expect(listBox).not.toHaveTextContent('No regions match');
  },
};

/**
 * Options a caller reads from a search, before any search ran: opened with nothing typed, the list
 * is empty and says nothing, since no text was looked for. Once text is typed, it says that nothing
 * matches.
 */
export const EmptyUntilTyped: Story = {
  args: { defaultItems: undefined, items: [] },
  play: async ({ canvas, canvasElement, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    const listBox = await pageOf(canvasElement).findByRole('listbox');
    await expect(listBox.textContent).toBe('');

    await userEvent.keyboard('eu');
    await waitFor(async () => {
      await expect(
        pageOf(canvasElement).getByRole('listbox'),
      ).toHaveTextContent('No regions match');
    });
  },
};

/** A region code, as such, typed: `validate` judges it. */
const regionCodeError = ({ inputValue }: { inputValue: string }) =>
  /^[a-z]{2}-[a-z]+$/.test(inputValue)
    ? undefined
    : 'Enter a region code such as eu-north.';

/**
 * Any region code, typed or chosen (`allowsCustomValue`). A bad code is shown its error on submit;
 * typing the fix clears the error at once, while the input keeps the focus.
 */
export const CustomValue: Story = {
  args: {
    label: 'Region code',
    placeholder: 'eu-north',
    allowsCustomValue: true,
    validate: regionCodeError,
    defaultItems: regions,
    children: (item: Option) => (
      <ListBoxItem id={item.id}>{item.id}</ListBoxItem>
    ),
  },
  render: (args: ComboBoxProps<Option>) => (
    <Form onSubmit={() => undefined} className='items-start'>
      <ComboBox {...args} />
      <Button type='submit'>Create</Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }: Context) => {
    const input = canvas.getByRole('combobox', { name: 'Region code' });
    // Taken first: while the list is open, React Aria hides the rest of the page from assistive
    // technology, and so from a query by role.
    const create = canvas.getByRole('button', { name: 'Create' });
    await userEvent.click(input);
    await userEvent.keyboard('mars');
    await userEvent.click(create);
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await userEvent.clear(input);
    await userEvent.keyboard('eu-north');
    await expect(input).toHaveFocus();
    await waitFor(async () => {
      await expect(input).not.toHaveAttribute('aria-invalid');
    });

    // Escape closes the list and keeps the typed code.
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('eu-north');
    await expect(input).not.toHaveAttribute('aria-invalid');
  },
};

/** No visible label, as in a toolbar: the combo box carries `aria-label`. */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Region' },
};

export const Controlled: Story = {
  render: function Render(args: ComboBoxProps<Option>) {
    const [value, setValue] = useState<Key | null>('us-west');
    return (
      <div className='flex flex-col gap-2'>
        <ComboBox {...args} value={value} onChange={setValue} />
        <p className='text-surface-foreground-muted text-xs'>
          Chosen: {value === null ? 'nothing' : String(value)}
        </p>
      </div>
    );
  },
};
