import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Checkbox, CheckboxGroup } from '../aria/checkbox/index.ts';
import { ColorField, ColorPicker, ColorSlider } from '../aria/color/index.ts';
import { ComboBox } from '../aria/combobox/index.ts';
import { DateField } from '../aria/datefield/index.ts';
import { DatePicker } from '../aria/datepicker/index.ts';
import { DateRangePicker } from '../aria/daterangepicker/index.ts';
import { ListBoxItem } from '../aria/listbox/index.ts';
import { NumberField } from '../aria/numberfield/index.ts';
import { Radio, RadioGroup } from '../aria/radiogroup/index.ts';
import { SearchField } from '../aria/searchfield/index.ts';
import { Select } from '../aria/select/index.ts';
import { Slider } from '../aria/slider/index.ts';
import { Tag, TagGroup } from '../aria/taggroup/index.ts';
import { TextArea } from '../aria/textarea/index.ts';
import { TextField } from '../aria/textfield/index.ts';
import { TimeField } from '../aria/timefield/index.ts';
import { Token, TokenField } from '../aria/tokenfield/index.ts';
import { InfoButton } from '../composites/infobutton/index.ts';
import { MultiSelect } from '../composites/multiselect/index.ts';
import { TextDropArea } from '../composites/textdroparea/index.ts';
import { labelLines } from './labellines.testing.ts';

const OPTIONAL = '(optional)';

/** The header every case is given: its label, the optional text, an info control, a description. */
const header = (label: string) => ({
  label,
  optionalText: OPTIONAL,
  info: <InfoButton aria-label={`About ${label}`} />,
  description: `What ${label} is for.`,
});

/** One field whose label stands above its control. */
type Case = {
  label: string;
  field: ReactNode;
  /** The error the field shows under its control here, for a field that takes one. */
  error?: string;
  /**
   * The element the description must describe (`aria-describedby`), and the element drawn as the
   * control, when that is another: a group's first choice, below the group's header.
   */
  control: (root: HTMLElement) => {
    described: HTMLElement;
    drawn?: HTMLElement;
  };
  /** Parts a field keeps at the end of its label row, which also stand above the description. */
  rowEnd?: (root: HTMLElement) => HTMLElement;
};

const byRole = (role: string) => (root: HTMLElement) => ({
  described: within(root).getByRole(role),
});

/** The trigger of a field that opens a popover; the info controls here open nothing. */
const trigger = (root: HTMLElement) => {
  const button = root.querySelector<HTMLElement>('button[aria-expanded]');
  if (button === null) {
    throw new Error('No trigger');
  }
  return { described: button };
};

/** A date field's or a picker's box: the outermost group, which React Aria names and describes. */
const outerGroup = (root: HTMLElement) => {
  const [group] = within(root).getAllByRole('group');
  if (group === undefined) {
    throw new Error('No group');
  }
  return { described: group };
};

const regions = [
  { id: 'north', name: 'North' },
  { id: 'south', name: 'South' },
];

const cases: Case[] = [
  {
    label: 'Name',
    field: <TextField {...header('Name')} errorMessage='Enter a name.' />,
    error: 'Enter a name.',
    control: byRole('textbox'),
  },
  {
    label: 'Notes',
    field: <TextArea {...header('Notes')} errorMessage='Shorten the notes.' />,
    error: 'Shorten the notes.',
    control: byRole('textbox'),
  },
  {
    label: 'Body',
    field: (
      <TextDropArea
        {...header('Body')}
        errorMessage='Enter a body.'
        dropType='text/plain'
        onTextDrop={() => undefined}
        dropErrorMessage='The dropped text could not be read.'
        dropRefusedMessage='Drop a single piece of plain text.'
      />
    ),
    error: 'Enter a body.',
    control: byRole('textbox'),
  },
  {
    label: 'Seats',
    field: (
      <NumberField
        {...header('Seats')}
        errorMessage='Enter one seat or more.'
      />
    ),
    error: 'Enter one seat or more.',
    control: byRole('textbox'),
  },
  {
    label: 'Search',
    field: <SearchField {...header('Search')} />,
    control: byRole('searchbox'),
  },
  {
    label: 'Region',
    field: (
      <Select
        {...header('Region')}
        count='(2)'
        errorMessage='Choose a region.'
        items={regions}
      >
        {(region) => <ListBoxItem id={region.id}>{region.name}</ListBoxItem>}
      </Select>
    ),
    error: 'Choose a region.',
    control: trigger,
  },
  {
    label: 'Area',
    field: (
      <ComboBox
        {...header('Area')}
        errorMessage='Choose an area.'
        noMatchesLabel='No areas match'
      >
        <ListBoxItem id='east'>East</ListBoxItem>
      </ComboBox>
    ),
    error: 'Choose an area.',
    control: byRole('combobox'),
  },
  {
    label: 'Channels',
    field: (
      <CheckboxGroup {...header('Channels')} errorMessage='Choose a channel.'>
        <Checkbox value='email'>Email</Checkbox>
      </CheckboxGroup>
    ),
    error: 'Choose a channel.',
    control: (root) => ({
      described: within(root).getByRole('group'),
      drawn: within(root).getByRole('checkbox'),
    }),
  },
  {
    label: 'Plan',
    field: (
      <RadioGroup {...header('Plan')} errorMessage='Choose a plan.'>
        <Radio value='team'>Team</Radio>
      </RadioGroup>
    ),
    error: 'Choose a plan.',
    control: (root) => ({
      described: within(root).getByRole('radiogroup'),
      drawn: within(root).getByRole('radio'),
    }),
  },
  {
    label: 'Volume',
    field: <Slider {...header('Volume')} hasValueOutput defaultValue={40} />,
    control: byRole('slider'),
    rowEnd: (root) => within(root).getByRole('status'),
  },
  {
    label: 'Start',
    field: (
      <DateField {...header('Start')} errorMessage='Enter a start date.' />
    ),
    error: 'Enter a start date.',
    control: outerGroup,
  },
  {
    label: 'Time',
    field: <TimeField {...header('Time')} errorMessage='Enter a time.' />,
    error: 'Enter a time.',
    control: outerGroup,
  },
  {
    label: 'Due',
    field: <DatePicker {...header('Due')} errorMessage='Enter a due date.' />,
    error: 'Enter a due date.',
    control: outerGroup,
  },
  {
    label: 'Period',
    field: (
      <DateRangePicker {...header('Period')} errorMessage='Enter a period.' />
    ),
    error: 'Enter a period.',
    control: outerGroup,
  },
  {
    label: 'Hex',
    field: <ColorField {...header('Hex')} errorMessage='Enter a color.' />,
    error: 'Enter a color.',
    control: byRole('textbox'),
  },
  {
    label: 'Hue',
    field: (
      <ColorSlider
        {...header('Hue')}
        channel='hue'
        defaultValue='hsl(210, 80%, 50%)'
        hasValueOutput
      />
    ),
    control: byRole('slider'),
    rowEnd: (root) => within(root).getByRole('status'),
  },
  {
    label: 'Fill',
    field: (
      <ColorPicker
        {...header('Fill')}
        hexFieldLabel='Hex'
        defaultValue='#1e66f5'
      />
    ),
    control: trigger,
  },
  {
    label: 'Labels',
    field: (
      <TagGroup {...header('Labels')} errorMessage='Remove a label.'>
        <Tag id='bug'>Bug</Tag>
      </TagGroup>
    ),
    error: 'Remove a label.',
    control: byRole('grid'),
  },
  {
    label: 'Message',
    field: (
      <TokenField {...header('Message')}>
        {(segment) => <Token>{segment.text}</Token>}
      </TokenField>
    ),
    control: byRole('textbox'),
  },
  {
    label: 'Tags',
    field: (
      <MultiSelect
        {...header('Tags')}
        summary='None chosen'
        searchLabel='Search tags'
        noMatchesLabel='No tags match'
        clearLabel='Clear'
        clearDisabledReason='Nothing is chosen'
        options={[{ id: 'design', label: 'Design' }]}
        selectedKeys={new Set()}
        onSelectionChange={() => undefined}
      />
    ),
    control: trigger,
  },
];

const FieldHeaders = () => (
  <div className='bg-surface grid grid-cols-2 gap-6 p-4'>
    {cases.map((item) => (
      <div key={item.label} data-field={item.label}>
        {item.field}
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Contract/Field header',
  component: FieldHeaders,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldHeaders>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Whether `first` comes before `second` both in the reading order and as drawn, from the top. */
const isAbove = (first: Element, second: Element) =>
  (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !==
    0 &&
  first.getBoundingClientRect().bottom <=
    second.getBoundingClientRect().top + 0.5;

/** The visible label: React Aria's hidden select repeats a select's label, out of sight. */
const labelOf = (root: HTMLElement, text: string) =>
  within(root).queryAllByText(text, {
    ignore: '[aria-hidden="true"] *, script, style',
  })[0];

/**
 * Every field whose label stands above its control draws one header, in one order, from the top:
 * the label row (the label, with the optional text inside it, and the info control beside it,
 * outside it), then the description, then the control, and the error under the control. The
 * description describes the control. Every field is checked and every broken rule listed, so one
 * run names each field that departs.
 */
export const OneOrderForEveryField: Story = {
  play: async ({ canvasElement }) => {
    const problems: string[] = [];
    const check = (holds: boolean, problem: string) => {
      if (!holds) {
        problems.push(problem);
      }
    };
    for (const item of cases) {
      const root = canvasElement.querySelector<HTMLElement>(
        `[data-field="${item.label}"]`,
      );
      if (root === null) {
        throw new Error(`${item.label} is not drawn`);
      }
      const name = item.label;
      const label = labelOf(root, name);
      const info = within(root).queryByRole('button', {
        name: `About ${name}`,
      });
      const description = within(root).queryByText(`What ${name} is for.`);
      const { described, drawn = described } = item.control(root);
      const end = item.rowEnd?.(root);
      const error =
        item.error === undefined
          ? undefined
          : within(root).queryByText(item.error);
      // Each rule is checked whenever the parts it needs are drawn, so a missing part does not
      // hide the other rules a field breaks.
      check(label !== undefined, `${name}: no label`);
      check(info !== null, `${name}: no info control`);
      check(description !== null, `${name}: no description`);
      check(error !== null, `${name}: no error shown`);
      if (label !== undefined) {
        check(
          label.textContent.includes(OPTIONAL),
          `${name}: the optional text is not in the label ("${label.textContent}")`,
        );
        check(
          info === null || !label.contains(info),
          `${name}: the info control is inside the label`,
        );
        check(
          end === undefined || !label.contains(end),
          `${name}: the row's end is inside the label`,
        );
      }
      if (description !== null) {
        const header: [string, HTMLElement | null | undefined][] = [
          ['label', label],
          ['info control', info],
          ["row's end", end],
        ];
        for (const [part, element] of header) {
          check(
            element === null ||
              element === undefined ||
              isAbove(element, description),
            `${name}: the ${part} is not above the description`,
          );
        }
        check(
          isAbove(description, drawn),
          `${name}: the description is not above the control`,
        );
        check(
          description.id !== '' &&
            (described.getAttribute('aria-describedby') ?? '')
              .split(' ')
              .includes(description.id),
          `${name}: the description does not describe the control`,
        );
      }
      if (error !== null && error !== undefined) {
        check(
          isAbove(drawn, error),
          `${name}: the error is not under the control`,
        );
      }
    }
    await expect(problems).toEqual([]);
  },
};

/**
 * A select's count stays inside its label, after the label's text and before the optional text, so
 * the label that names the trigger holds all three; the info control follows the label.
 */
export const CountStaysInTheLabel: Story = {
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-field="Region"]',
    );
    if (root === null) {
      throw new Error('Region is not drawn');
    }
    const label = labelOf(root, 'Region');
    if (label === undefined) {
      throw new Error('Region has no label');
    }
    await expect(label.textContent).toBe(`Region (2) ${OPTIONAL}`);
    await expect(
      trigger(root).described.getAttribute('aria-labelledby')?.split(' '),
    ).toContain(label.id);
  },
};

/**
 * An info control does not make its label row taller: of two fields side by side, the one with an
 * `InfoButton` starts its control where the one without does. The button keeps its whole 28px box,
 * which ends short of the description under it, and its focus ring, drawn past the box, is not
 * clipped by anything around it.
 */
export const InfoDoesNotGrowTheRow: Story = {
  render: () => (
    <div className='bg-surface grid w-[36rem] grid-cols-2 gap-6 p-4'>
      <div data-field='With info'>
        <TextField
          label='Path'
          info={<InfoButton aria-label='About the path' />}
          description='Where the files are read from.'
        />
      </div>
      <div data-field='Without info'>
        <TextField label='Owner' description='Who answers for the files.' />
      </div>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const withInfo = canvasElement.querySelector<HTMLElement>(
      '[data-field="With info"]',
    );
    const without = canvasElement.querySelector<HTMLElement>(
      '[data-field="Without info"]',
    );
    if (withInfo === null || without === null) {
      throw new Error('The fields are not drawn');
    }
    const top = (element: Element) =>
      Math.round(element.getBoundingClientRect().top);
    await expect(
      top(within(withInfo).getByRole('textbox')),
      'the control of the field with an info control',
    ).toBe(top(within(without).getByRole('textbox')));

    const info = within(withInfo).getByRole('button', {
      name: 'About the path',
    });
    const description = within(withInfo).getByText(
      'Where the files are read from.',
    );
    await expect(info.getBoundingClientRect().height).toBe(28);
    await expect(info.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      description.getBoundingClientRect().top + 0.5,
    );

    await userEvent.tab();
    await waitFor(async () => {
      await expect(info).toHaveAttribute('data-focus-visible', 'true');
    });
    const ring = getComputedStyle(info);
    await expect(ring.outlineStyle).toBe('solid');
    await expect(ring.outlineWidth).toBe('2px');
    for (
      let around = info.parentElement;
      around !== null && around !== canvasElement;
      around = around.parentElement
    ) {
      await expect(
        getComputedStyle(around).overflow,
        `${around.tagName.toLowerCase()}.${around.className}`,
      ).toBe('visible');
    }
  },
};

/** The widths the sweep draws its field at: 150px to 300px, by 2px. */
const SWEEP = Array.from({ length: 76 }, (_, index) => 150 + index * 2);

const PATH = 'Path to the content folder';

/**
 * The info control follows the label's last word, on whatever line the label ends, and is never
 * parted from it. Drawn at every width from 150px to 300px, by 2px, a label with the optional
 * marker and an info control stands on one line and then wraps before each of its last words in
 * turn; at every width the info control stands right after the label's last word, on its last
 * line, never alone at the start of a line. It makes no line taller (the control starts one gap
 * under the label's last line), and the label is never cut.
 */
export const InfoFollowsTheLabel: Story = {
  render: () => (
    <div className='bg-surface flex flex-col gap-4 p-4'>
      {SWEEP.map((width) => (
        <div
          key={width}
          data-width={width}
          style={{ width: `${String(width)}px` }}
        >
          <TextField
            label={PATH}
            optionalText={OPTIONAL}
            info={
              <InfoButton aria-label={`About the path, ${String(width)}px`} />
            }
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const problems: string[] = [];
    const lineCounts = new Set<number>();
    for (const width of SWEEP) {
      const at = `${String(width)}px`;
      const root = canvasElement.querySelector<HTMLElement>(
        `[data-width="${String(width)}"]`,
      );
      const label = root === null ? undefined : labelOf(root, PATH);
      if (root === null || label === undefined) {
        throw new Error(`The field at ${at} is not drawn`);
      }
      const lines = labelLines(label);
      const last = lines.at(-1);
      if (last === undefined) {
        throw new Error(`The label at ${at} draws no text`);
      }
      lineCounts.add(lines.length);
      const info = within(root).getByRole('button', {
        name: `About the path, ${at}`,
      });
      const box = info.getBoundingClientRect();
      const after = Math.round(box.left - last.right);
      const off = Math.round((box.top + box.bottom) / 2 - last.middle);
      if (after < 0 || after > 8 || Math.abs(off) > 1) {
        problems.push(
          `${at}: the info control does not follow the label's last word (it starts ${String(after)}px after it, ${String(off)}px off its line)`,
        );
      }
      // Each of the label's lines is one line tall, and the control starts one gap (the column's
      // 4px) under the last.
      const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
      const fieldBox = root.getBoundingClientRect();
      const controlTop = Math.round(
        within(root).getByRole('textbox').getBoundingClientRect().top -
          fieldBox.top,
      );
      if (controlTop !== lines.length * lineHeight + 4) {
        problems.push(
          `${at}: the control starts at ${String(controlTop)}, under ${String(lines.length)} lines of ${String(lineHeight)}px`,
        );
      }
      if (
        !lines.every(
          (line) =>
            line.left >= fieldBox.left - 0.5 &&
            line.right <= fieldBox.right + 0.5,
        )
      ) {
        problems.push(`${at}: the label is cut`);
      }
    }
    // The sweep holds the label on one line and wrapped, or it proves less than it says.
    await expect(lineCounts.has(1), 'a width with one line').toBe(true);
    await expect(
      [...lineCounts].some((count) => count > 1),
      'a width at which the label wraps',
    ).toBe(true);
    await expect(problems).toEqual([]);
  },
};
