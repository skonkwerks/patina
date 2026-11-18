import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../aria/button/index.js';
import { ComboBox } from '../aria/combobox/index.js';
import { ListBoxItem } from '../aria/listbox/index.js';
import { Select } from '../aria/select/index.js';
import { InfoButton } from '../composites/infobutton/index.js';
import { labelLines } from './labellines.testing.js';

const PENDING = 'Loading the choices…';
const OPTIONAL = '(optional)';

/** A description long enough to take two lines in the story's wide columns. */
const TWO_LINES =
  'Where the data is stored, which decides the laws that apply to it and how quickly it answers.';

const regions = [
  { id: 'north', name: 'North' },
  { id: 'south', name: 'South' },
];

/**
 * How much of the label row the label leaves to the pending words: all they need, some of it (the
 * words are cut with an ellipsis), or none (the label wraps and takes the row, so only the spinner
 * shows, which the owner accepted for a narrow field). In each, the full words are what describes
 * the control.
 */
type Room = 'whole' | 'short' | 'none';

/** One field that reads its choices, as the story draws it. */
type Case = {
  /** The field's place in the story, also its label unless `label` says otherwise. */
  name: string;
  kind: 'select' | 'combobox';
  label?: string;
  description?: string;
  /** With the optional marker and an info control in its label row. */
  hasMarkerAndInfo?: boolean;
  room: Room;
};

/**
 * The four fields of the contract: a select and a combo box, each with no description and with one
 * of two lines.
 */
const wideCases: Case[] = [
  { name: 'Select, no description', kind: 'select', room: 'whole' },
  {
    name: 'Select, two lines',
    kind: 'select',
    description: TWO_LINES,
    room: 'whole',
  },
  { name: 'ComboBox, no description', kind: 'combobox', room: 'whole' },
  {
    name: 'ComboBox, two lines',
    kind: 'combobox',
    description: TWO_LINES,
    room: 'whole',
  },
];

/**
 * Fields 12rem wide, with the optional marker and an info control: a label that fills its row, and
 * a short one.
 */
const narrowCases: Case[] = [
  {
    name: 'Select, long label',
    kind: 'select',
    label: 'Region where the data is stored',
    hasMarkerAndInfo: true,
    room: 'none',
  },
  {
    name: 'ComboBox, long label',
    kind: 'combobox',
    label: 'Region where the data is stored',
    hasMarkerAndInfo: true,
    room: 'none',
  },
  {
    name: 'Select, short label',
    kind: 'select',
    label: 'Zone',
    hasMarkerAndInfo: true,
    room: 'short',
  },
  {
    name: 'ComboBox, short label',
    kind: 'combobox',
    label: 'Zone',
    hasMarkerAndInfo: true,
    room: 'short',
  },
];

const labelOf = (item: Case) => item.label ?? item.name;

/**
 * One field as the story draws it. Given `isPending`, it reads its choices (it takes
 * `pendingText`); without it, it is the same field with no `pendingText`, which the story compares
 * it with.
 */
const Field = ({ item, isPending }: { item: Case; isPending?: boolean }) => {
  const header = {
    label: labelOf(item),
    description: item.description,
    optionalText: item.hasMarkerAndInfo === true ? OPTIONAL : undefined,
    info:
      item.hasMarkerAndInfo === true ? (
        <InfoButton
          aria-label={`About ${item.name}${isPending === undefined ? ', without pendingText' : ''}`}
        />
      ) : undefined,
  };
  if (item.kind === 'select') {
    return isPending === undefined ? (
      <Select {...header} items={regions}>
        {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
      </Select>
    ) : (
      <Select
        {...header}
        isPending={isPending}
        pendingText={PENDING}
        items={regions}
      >
        {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
      </Select>
    );
  }
  return isPending === undefined ? (
    <ComboBox
      {...header}
      defaultItems={regions}
      noMatchesLabel='No regions match'
    >
      {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
    </ComboBox>
  ) : (
    <ComboBox
      {...header}
      isPending={isPending}
      pendingText={PENDING}
      defaultItems={regions}
      noMatchesLabel='No regions match'
    >
      {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
    </ComboBox>
  );
};

/**
 * Each field, and beside it the same field without `pendingText`, in columns of one width; and a
 * button that starts and stops reading the choices.
 */
const FieldPending = ({
  cases,
  width,
}: {
  cases: Case[];
  /** The columns' width: wide enough for the pending words, or narrow. */
  width: 'w-96' | 'w-48';
}) => {
  const [isPending, setIsPending] = useState(false);
  return (
    <div className='flex flex-col gap-4'>
      <Button className='self-start' onPress={() => setIsPending(!isPending)}>
        {isPending ? 'Stop reading' : 'Read the choices'}
      </Button>
      <div className='text-surface-foreground-muted flex gap-6 text-xs'>
        <p className={width}>With pendingText</p>
        <p className={width}>Without</p>
      </div>
      {cases.map((item) => (
        <div key={item.name} className='flex gap-6'>
          <div data-field={item.name} className={width}>
            <Field item={item} isPending={isPending} />
          </div>
          <div data-twin={item.name} className={width}>
            <Field item={item} />
          </div>
        </div>
      ))}
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

const rootOf = (
  canvasElement: HTMLElement,
  attribute: string,
  name: string,
) => {
  const root = canvasElement.querySelector<HTMLElement>(
    `[${attribute}="${name}"]`,
  );
  if (root === null) {
    throw new Error(`${name} is not drawn`);
  }
  return root;
};

/** The control of a field: a select's trigger, or a combo box's input. */
const controlOf = (root: HTMLElement, item: Case) => {
  if (item.kind === 'combobox') {
    return within(root).getByRole('combobox');
  }
  const trigger = root.querySelector<HTMLElement>('button[aria-expanded]');
  if (trigger === null) {
    throw new Error(`${item.name} has no trigger`);
  }
  return trigger;
};

/** The visible label: React Aria's hidden select repeats a select's label, out of sight. */
const labelElementOf = (root: HTMLElement, item: Case) => {
  const [label] = within(root).queryAllByText(labelOf(item), {
    exact: false,
    ignore: '[aria-hidden="true"] *, script, style, option',
    selector: 'label, span',
  });
  if (label === undefined) {
    throw new Error(`${item.name} has no label`);
  }
  return label;
};

/** The pending words, where they are drawn in the field. */
const wordsOf = (root: HTMLElement) =>
  within(root).queryByText(PENDING, {
    ignore: '[aria-hidden="true"] *, script, style',
  });

/** The spinner: the one drawing outside the field's buttons (the trigger's chevron and the info icon are in theirs). */
const spinnerOf = (root: HTMLElement) =>
  [...root.querySelectorAll('svg')].find(
    (svg) => svg.closest('button') === null,
  );

/** The text of what describes a control: the elements its `aria-describedby` lists. */
const describedText = (control: HTMLElement) =>
  (control.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? '')
    .join(' ');

/** How many lines the label takes. */
const linesOf = (label: HTMLElement) => labelLines(label).length;

/** How far under the label's last line the control (or its description) begins. */
const underLabel = (control: HTMLElement, label: HTMLElement) =>
  Math.round(
    control.getBoundingClientRect().top -
      (labelLines(label).at(-1)?.bottom ?? Number.NaN),
  );

/**
 * Whether the info control follows the label's last word directly, on the line where the label
 * ends: its box begins within 8px of that word's end (the 4px between them, and no line break),
 * and is centered on that line.
 */
const followsLabel = (info: HTMLElement, label: HTMLElement) => {
  const last = labelLines(label).at(-1);
  const box = info.getBoundingClientRect();
  return (
    last !== undefined &&
    box.left - last.right >= 0 &&
    box.left - last.right <= 8 &&
    Math.abs(middle(info) - last.middle) <= 1
  );
};

/** An element's top within its field's box. */
const top = (element: Element, field: Element) =>
  Math.round(
    element.getBoundingClientRect().top - field.getBoundingClientRect().top,
  );

const middle = (element: Element) => {
  const box = element.getBoundingClientRect();
  return (box.top + box.bottom) / 2;
};

/**
 * Starts and stops reading the choices, and checks every field at rest, while pending and after,
 * listing every broken rule, so one run names each field that departs:
 *
 * - **Nothing reserved.** At rest, nothing of the pending sign is drawn, and the control stands
 *   as far under the label as in the same field without `pendingText`: right under the label row
 *   when there is no description. Where both labels take the same lines, the controls stand
 *   level; only a label that fills its row may take a line more, for the spinner's square and
 *   its spacing (about 26px).
 * - **The control stays still**, and so does the label: neither moves nor changes size when
 *   pending starts or ends. The label is never cut: it wraps onto further lines instead.
 * - **The sign stands at the end of the label row** while pending: the spinner (always whole,
 *   inside the field, on the label's first line, after the label and its info control) and the
 *   words beside it, whole, cut with an ellipsis, or with no room at all, as the case says. With
 *   no room, the spinner stands alone, whole and visible, and the words still describe the control:
 *   the owner's accepted behavior for a narrow field.
 * - **The info control follows the label's last word,** on the line where the label ends, pending
 *   or not, in the field and in the same field without `pendingText`.
 * - **The words describe the control while pending, and only then;** a description stays drawn
 *   and describes the control throughout. The spinner has no name and is hidden from assistive
 *   technology, so the word is not said twice.
 */
const checkPending = async (
  cases: Case[],
  {
    canvasElement,
    canvas,
    userEvent,
  }: Parameters<NonNullable<Story['play']>>[0],
) => {
  const problems: string[] = [];
  const check = (holds: boolean, problem: string) => {
    if (!holds) {
      problems.push(problem);
    }
  };
  const fields = cases.map((item) => {
    const root = rootOf(canvasElement, 'data-field', item.name);
    const twin = rootOf(canvasElement, 'data-twin', item.name);
    return {
      item,
      root,
      control: controlOf(root, item),
      label: labelElementOf(root, item),
      twin,
      twinControl: controlOf(twin, item),
      twinLabel: labelElementOf(twin, item),
    };
  });
  // Each field's own measures, so one field's move is not read into another's.
  const measure = () =>
    fields.map(({ root, control, label }) => ({
      control: top(control, root),
      labelHeight: Math.round(label.getBoundingClientRect().height),
      labelWidth: Math.round(label.getBoundingClientRect().width),
    }));

  for (const {
    item,
    root,
    label,
    control,
    twin,
    twinControl,
    twinLabel,
  } of fields) {
    const name = item.name;
    if (item.description !== undefined) {
      const description = within(root).getByText(item.description);
      check(
        description.getBoundingClientRect().height >= 31,
        `${name}: the description does not take two lines`,
      );
    }
    const lineCount = linesOf(label);
    check(
      item.room === 'none' ? lineCount >= 2 : lineCount === 1,
      `${name}: the label takes ${String(lineCount)} lines`,
    );
    const fieldBox = root.getBoundingClientRect();
    check(
      labelLines(label).every(
        (line) =>
          line.left >= fieldBox.left - 0.5 &&
          line.right <= fieldBox.right + 0.5,
      ),
      `${name}: the label is cut`,
    );
    if (item.hasMarkerAndInfo === true) {
      check(
        label.textContent.includes(OPTIONAL),
        `${name}: the optional marker is not in the label`,
      );
      check(
        followsLabel(
          within(root).getByRole('button', { name: `About ${name}` }),
          label,
        ) &&
          followsLabel(
            within(twin).getByRole('button', {
              name: `About ${name}, without pendingText`,
            }),
            twinLabel,
          ),
        `${name}: the info control does not follow the label's last word`,
      );
    }
    check(wordsOf(root) === null, `${name}: the pending words show at rest`);
    check(spinnerOf(root) === undefined, `${name}: a spinner shows at rest`);
    check(
      underLabel(control, label) === underLabel(twinControl, twinLabel),
      `${name}: the control stands ${String(underLabel(control, label))}px under the label, where the same field without pendingText has it ${String(underLabel(twinControl, twinLabel))}px under`,
    );
    // Its square kept at the row's end, the spinner leaves a label in a field given `pendingText`
    // a little less room, so a label that fills its row may wrap one line sooner; any other label
    // wraps as it does without `pendingText`, and its control stands where that field's does.
    const twinLines = linesOf(twinLabel);
    if (lineCount === twinLines) {
      check(
        top(control, root) === top(twinControl, twin),
        `${name}: the control stands at ${String(top(control, root))}, where the same field without pendingText has it at ${String(top(twinControl, twin))}`,
      );
    } else {
      check(
        item.room === 'none',
        `${name}: the label takes ${String(lineCount)} lines, where the same field without pendingText takes ${String(twinLines)}`,
      );
    }
  }
  const atRest = measure();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Read the choices' }),
  );
  await waitFor(async () => {
    await expect(
      canvas.getByRole('button', { name: 'Stop reading' }),
    ).toBeInTheDocument();
  });
  const whilePending = measure();
  fields.forEach(({ item, root, control, label }, index) => {
    const name = item.name;
    const rest = atRest[index];
    const now = whilePending[index];
    check(
      now?.control === rest?.control,
      `${name}: the control moved from ${String(rest?.control)} to ${String(now?.control)} when pending began`,
    );
    check(
      now?.labelHeight === rest?.labelHeight &&
        now?.labelWidth === rest?.labelWidth,
      `${name}: the label changed from ${String(rest?.labelWidth)}x${String(rest?.labelHeight)} to ${String(now?.labelWidth)}x${String(now?.labelHeight)} when pending began`,
    );
    // The middle of the label's first line, where the pending sign stands.
    const firstLine = labelLines(label)[0]?.middle ?? Number.NaN;
    const fieldBox = root.getBoundingClientRect();
    const labelBox = label.getBoundingClientRect();
    const info =
      item.hasMarkerAndInfo === true
        ? within(root).getByRole('button', { name: `About ${name}` })
        : undefined;
    const spinner = spinnerOf(root);
    if (spinner === undefined) {
      problems.push(`${name}: no spinner while pending`);
    } else {
      const box = spinner.getBoundingClientRect();
      check(
        box.width > 0 &&
          box.left >= fieldBox.left - 0.5 &&
          box.right <= fieldBox.right + 0.5,
        `${name}: the spinner is not whole inside the field`,
      );
      // Decoration: the words describe the control, so the spinner has no name and is hidden.
      check(
        spinner.getAttribute('aria-hidden') === 'true' &&
          !spinner.hasAttribute('role') &&
          !spinner.hasAttribute('aria-label') &&
          !spinner.hasAttribute('aria-labelledby') &&
          spinner.querySelector('title') === null,
        `${name}: the spinner is not decoration hidden from assistive technology`,
      );
      check(
        Math.abs(middle(spinner) - firstLine) <= 1 &&
          box.left >= labelBox.right - 0.5 &&
          (info === undefined ||
            box.left >= info.getBoundingClientRect().right - 0.5),
        `${name}: the spinner is not at the end of the label row`,
      );
      check(
        box.bottom <= control.getBoundingClientRect().top + 0.5,
        `${name}: the spinner is not above the control`,
      );
    }
    const words = wordsOf(root);
    if (words === null) {
      problems.push(`${name}: no pending words while pending`);
    } else {
      if (item.room !== 'none') {
        check(
          Math.abs(middle(words) - firstLine) <= 1 &&
            (spinner === undefined ||
              words.getBoundingClientRect().left >=
                spinner.getBoundingClientRect().right - 0.5),
          `${name}: the pending words do not follow the spinner in the label row`,
        );
      }
      const isCut = words.scrollWidth > words.clientWidth;
      const isShown = words.clientWidth > 0;
      check(
        item.room !== 'whole' || (isShown && !isCut),
        `${name}: the pending words are not shown whole`,
      );
      check(
        item.room !== 'short' || (isShown && isCut),
        `${name}: the pending words are not cut short`,
      );
    }
    if (info !== undefined) {
      check(
        followsLabel(info, label),
        `${name}: the info control does not follow the label's last word while pending`,
      );
    }
    const described = describedText(control);
    check(
      described.includes(PENDING),
      `${name}: the pending words do not describe the control`,
    );
    // The owner's choice for a narrow field: when the label wraps and takes its row, the words get
    // no room and the spinner stands alone, whole and visible on the label's first line, still
    // decoration hidden from assistive technology, while the words still describe the control.
    if (item.room === 'none') {
      const box = spinner?.getBoundingClientRect();
      check(
        spinner !== undefined &&
          box !== undefined &&
          spinner.checkVisibility() &&
          box.width > 0 &&
          box.left >= fieldBox.left - 0.5 &&
          box.right <= fieldBox.right + 0.5 &&
          Math.abs(middle(spinner) - firstLine) <= 1 &&
          spinner.getAttribute('aria-hidden') === 'true' &&
          !spinner.hasAttribute('aria-label'),
        `${name}: the spinner does not stand alone, whole, visible and hidden from assistive technology on the label's first line`,
      );
      check(
        words !== null && words.getBoundingClientRect().width === 0,
        `${name}: the pending words show although the label leaves them no room`,
      );
      check(
        described.includes(PENDING),
        `${name}: the pending words do not describe the control when they have no room`,
      );
    }
    if (item.description !== undefined) {
      check(
        described.includes(item.description),
        `${name}: the description does not describe the control while pending`,
      );
      check(
        getComputedStyle(within(root).getByText(item.description))
          .visibility !== 'hidden',
        `${name}: the description is hidden while pending`,
      );
    }
  });

  await userEvent.click(canvas.getByRole('button', { name: 'Stop reading' }));
  await waitFor(async () => {
    await expect(
      canvas.getByRole('button', { name: 'Read the choices' }),
    ).toBeInTheDocument();
  });
  const afterwards = measure();
  fields.forEach(({ item, root, control }, index) => {
    const name = item.name;
    const rest = atRest[index];
    const now = afterwards[index];
    check(
      now?.control === rest?.control,
      `${name}: the control moved from ${String(rest?.control)} to ${String(now?.control)} when pending ended`,
    );
    check(
      now?.labelHeight === rest?.labelHeight &&
        now?.labelWidth === rest?.labelWidth,
      `${name}: the label changed when pending ended`,
    );
    check(
      wordsOf(root) === null && spinnerOf(root) === undefined,
      `${name}: the pending sign still shows`,
    );
    const described = describedText(control);
    check(
      !described.includes(PENDING),
      `${name}: the pending words still describe the control`,
    );
    if (item.description !== undefined) {
      check(
        described.includes(item.description),
        `${name}: the description does not describe the control afterwards`,
      );
    }
  });
  await expect(problems).toEqual([]);
};

/**
 * A select and a combo box, each with no description and with one of two lines: while they read
 * their choices, the spinner and its words stand at the end of the label row, which is there
 * anyway, so nothing is reserved for them and nothing moves when the reading starts or ends.
 */
export const PendingKeepsTheControlStill: Story = {
  args: { cases: wideCases, width: 'w-96' },
  play: async (context) => {
    await checkPending(wideCases, context);
  },
};

/**
 * Fields 12rem wide, with the optional marker and an info control. A long label wraps onto further
 * lines and is never cut, the marker wrapping with it; the info control follows its last word, on
 * whatever line it ends, and the pending sign stands at the end of its first line. The pending
 * words take only the room the label leaves, so they never wrap or narrow the label: with some
 * room they are cut with an ellipsis, and with none only the spinner shows, as the owner accepted
 * for a narrow field (the words still describe the control). The spinner's square stays kept at
 * the row's end, drawn or not, so the label wraps the same pending or not and the control never
 * moves. That square and its spacing, about 26px, are the one room a field given `pendingText`
 * keeps: a label whose first line nearly fills its row may wrap a word sooner than in the same
 * field without `pendingText` (the long label here does not).
 */
export const NarrowFields: Story = {
  args: { cases: narrowCases, width: 'w-48' },
  play: async (context) => {
    await checkPending(narrowCases, context);
  },
};
