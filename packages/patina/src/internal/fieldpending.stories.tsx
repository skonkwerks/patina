import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../aria/button/index.ts';
import { ComboBox } from '../aria/combobox/index.ts';
import { ListBoxItem } from '../aria/listbox/index.ts';
import { Select } from '../aria/select/index.ts';

const PENDING = 'Loading the choices…';

/** A description long enough to take two lines in the story's columns. */
const TWO_LINES =
  'Where the data is stored, which decides the laws that apply to it and how quickly it answers.';

const regions = [
  { id: 'north', name: 'North' },
  { id: 'south', name: 'South' },
];

/** One field that reads its choices, as the story draws it. */
type Case = {
  name: string;
  description?: string;
  kind: 'select' | 'combobox';
};

const cases: Case[] = [
  { name: 'Select, no description', kind: 'select' },
  { name: 'Select, two lines', kind: 'select', description: TWO_LINES },
  { name: 'ComboBox, no description', kind: 'combobox' },
  { name: 'ComboBox, two lines', kind: 'combobox', description: TWO_LINES },
];

const Field = ({ item, isPending }: { item: Case; isPending: boolean }) =>
  item.kind === 'select' ? (
    <Select
      label={item.name}
      description={item.description}
      isPending={isPending}
      pendingText={PENDING}
      items={regions}
    >
      {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
    </Select>
  ) : (
    <ComboBox
      label={item.name}
      description={item.description}
      isPending={isPending}
      pendingText={PENDING}
      defaultItems={regions}
      noMatchesLabel='No regions match'
    >
      {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
    </ComboBox>
  );

/** The fields, and a button that starts and stops reading their choices. */
const FieldPending = () => {
  const [isPending, setIsPending] = useState(false);
  return (
    <div className='flex flex-col gap-4'>
      <Button className='self-start' onPress={() => setIsPending(!isPending)}>
        {isPending ? 'Stop reading' : 'Read the choices'}
      </Button>
      <div className='grid w-[36rem] grid-cols-2 gap-6'>
        {cases.map((item) => (
          <div key={item.name} data-field={item.name}>
            <Field item={item} isPending={isPending} />
          </div>
        ))}
      </div>
    </div>
  );
};

const meta = {
  title: 'Contract/Field pending',
  component: FieldPending,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldPending>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The control of a case: a select's trigger, or a combo box's input. */
const controlOf = (root: HTMLElement, item: Case) =>
  item.kind === 'select'
    ? within(root).getByRole('button', { name: new RegExp(item.name) })
    : within(root).getByRole('combobox');

/** The text of what describes a control: the elements its `aria-describedby` lists. */
const describedText = (control: HTMLElement) =>
  (control.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? '')
    .join(' ');

/**
 * While a field reads its choices, the spinner and its words stand in the description's place, and
 * the place keeps its height: the control does not move when the reading starts or ends, whether
 * the field has no description (the place keeps the pending line's room) or one of two lines (the
 * place keeps the description's). The control is described by the pending words while pending, and
 * by its description again afterwards.
 */
export const PendingKeepsTheControlStill: Story = {
  play: async ({ canvasElement, canvas, userEvent }) => {
    const roots = cases.map((item) => {
      const root = canvasElement.querySelector<HTMLElement>(
        `[data-field="${item.name}"]`,
      );
      if (root === null) {
        throw new Error(`${item.name} is not drawn`);
      }
      return { item, root, control: controlOf(root, item) };
    });
    // The two-line descriptions take two lines, or the check below proves nothing about them.
    for (const { item, root } of roots) {
      if (item.description !== undefined) {
        const description = within(root).getByText(item.description);
        await expect(
          description.getBoundingClientRect().height,
          `${item.name}: the description's lines`,
        ).toBeGreaterThanOrEqual(31);
      }
    }
    // Each control's top within its own field, so a field's move is not read into another's.
    const tops = () =>
      roots.map(({ root, control }) =>
        Math.round(
          control.getBoundingClientRect().top -
            root.getBoundingClientRect().top,
        ),
      );
    const atRest = tops();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Read the choices' }),
    );
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Stop reading' }),
      ).toBeInTheDocument();
    });
    const problems: string[] = [];
    const whilePending = tops();
    roots.forEach(({ item, control }, index) => {
      if (whilePending[index] !== atRest[index]) {
        problems.push(
          `${item.name}: the control moved from ${String(atRest[index])} to ${String(whilePending[index])} when pending began`,
        );
      }
      if (!describedText(control).includes(PENDING)) {
        problems.push(
          `${item.name}: the pending words do not describe the control`,
        );
      }
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Stop reading' }));
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Read the choices' }),
      ).toBeInTheDocument();
    });
    const afterwards = tops();
    roots.forEach(({ item, control }, index) => {
      if (afterwards[index] !== atRest[index]) {
        problems.push(
          `${item.name}: the control moved from ${String(atRest[index])} to ${String(afterwards[index])} when pending ended`,
        );
      }
      const described = describedText(control);
      if (described.includes(PENDING)) {
        problems.push(
          `${item.name}: the pending words still describe the control`,
        );
      }
      if (
        item.description !== undefined &&
        !described.includes(item.description)
      ) {
        problems.push(
          `${item.name}: the description does not describe the control again`,
        );
      }
    });
    await expect(problems).toEqual([]);
  },
};
