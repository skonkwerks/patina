import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { ResizableTableContainerProps } from 'react-aria-components';
import { expect, within } from 'storybook/test';

import {
  Cell,
  Column,
  type ColumnProps,
  Row,
  Table,
  TableBody,
  TableHeader,
  type TableProps,
} from './index.js';

type Deployment = {
  id: string;
  service: string;
  region: string;
  version: string;
  owner: string;
  started: string;
};

const deployments: Deployment[] = [
  {
    id: 'd-1',
    service: 'checkout-api',
    region: 'eu-central-1 (Frankfurt)',
    version: '2026.11.18-rc.3',
    owner: 'Payments platform team',
    started: 'Nov 18, 09:42',
  },
  {
    id: 'd-2',
    service: 'search-indexer',
    region: 'us-east-2 (Ohio)',
    version: '2026.11.17',
    owner: 'Discovery team',
    started: 'Nov 17, 16:05',
  },
  {
    id: 'd-3',
    service: 'notifications',
    region: 'ap-southeast-2 (Sydney)',
    version: '2026.11.12-hotfix.1',
    owner: 'Messaging team',
    started: 'Nov 12, 22:18',
  },
];

const meta = {
  title: 'Aria/Table/Column Widths',
  component: Table,
  args: {
    'aria-label': 'Deployments',
    emptyState: { title: 'No deployments yet' },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

type Widths = Parameters<
  NonNullable<ResizableTableContainerProps['onResize']>
>[0];

/** The columns, each given the sizes the story passes for its id. */
const DeploymentTable = ({
  sizes = {},
  ...props
}: TableProps & {
  sizes?: Partial<
    Record<
      keyof Deployment,
      Pick<ColumnProps, 'width' | 'defaultWidth' | 'minWidth' | 'maxWidth'>
    >
  >;
}) => (
  <Table {...props}>
    <TableHeader>
      <Column id='service' isRowHeader {...sizes.service}>
        Service
      </Column>
      <Column id='region' {...sizes.region}>
        Region
      </Column>
      <Column id='version' {...sizes.version}>
        Version
      </Column>
      <Column id='owner' {...sizes.owner}>
        Owner
      </Column>
      <Column id='started' {...sizes.started}>
        Started
      </Column>
    </TableHeader>
    <TableBody items={deployments}>
      {(deployment) => (
        <Row id={deployment.id}>
          <Cell>{deployment.service}</Cell>
          <Cell>{deployment.region}</Cell>
          <Cell>{deployment.version}</Cell>
          <Cell>{deployment.owner}</Cell>
          <Cell>{deployment.started}</Cell>
        </Row>
      )}
    </TableBody>
  </Table>
);

/** The table's scroller: the element around it that scrolls sideways. */
const scrollerOf = (table: HTMLElement) => {
  const scroller = table.parentElement;
  if (scroller === null) {
    throw new Error('The table stands in no scroller.');
  }
  return scroller;
};

const widthOf = (element: Element) => element.getBoundingClientRect().width;

/**
 * The keys that reach a column's resizer as a person's do: Tab into the table, Right along the
 * first row to the column's cell, and Up to its heading, where the focus moves into the resizer.
 */
const toResizer = (column: number) =>
  `{Tab}${'{ArrowRight}'.repeat(column)}{ArrowUp}`;

/**
 * Each column is as wide as its content, and a cell's text stays whole on one line. In a place
 * narrower than the columns, the table scrolls sideways inside its frame, as Cloudscape's does,
 * and the frame keeps to its place.
 */
export const WiderThanItsPlace: Story = {
  render: (args) => (
    <div className='max-w-md'>
      <DeploymentTable {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const table = canvas.getByRole('grid');
    const scroller = scrollerOf(table);
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    // The frame keeps to its place: the story's narrow box.
    const place = canvasElement.firstElementChild;
    if (place === null) {
      throw new Error('The story renders nothing.');
    }
    await expect(widthOf(scroller)).toBeLessThanOrEqual(widthOf(place));
    // The longest text is whole: its cell is not cut.
    const owner = canvas.getByText('Payments platform team');
    await expect(owner.scrollWidth).toBeLessThanOrEqual(owner.clientWidth);
  },
};

/**
 * Sizes a column sets, as React Aria names them: `width` in pixels (or a percentage), and
 * `minWidth`, which a column keeps even where its content is narrower. A column of a table that is
 * not resizable is never narrower than its content on one line.
 */
export const SizedColumns: Story = {
  render: (args) => (
    <DeploymentTable
      {...args}
      sizes={{ service: { width: 200 }, started: { minWidth: 180 } }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      widthOf(canvas.getByRole('columnheader', { name: 'Service' })),
    ).toBeCloseTo(200, 0);
    await expect(
      widthOf(canvas.getByRole('columnheader', { name: 'Started' })),
    ).toBeGreaterThanOrEqual(180);
  },
};

/**
 * `allowsColumnResizing`: each heading ends with a resizer, to drag, or to press Enter on and move
 * with the arrow keys, 10px a press, then Enter to finish (React Aria's). A column without a width
 * shares what the others leave, so the columns fill the frame, and none gets narrower than 120px
 * unless it says. React Aria holds the widths while the table is mounted.
 */
export const Resizable: Story = {
  args: { allowsColumnResizing: true, selectionMode: 'multiple' },
  render: (args) => (
    <DeploymentTable {...args} sizes={{ owner: { defaultWidth: 240 } }} />
  ),
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('grid');
    // In a resizable table, a heading's name also holds its resizer's value ("240 pixels"), since
    // React Aria's resizer is a range input inside the heading; match the heading by its text.
    const heading = (name: string) =>
      canvas.getByRole('columnheader', { name: new RegExp(`^${name}`) });
    // A resizer for every column but the selection column's.
    await expect(canvas.getAllByRole('slider')).toHaveLength(5);
    await expect(widthOf(heading('Owner'))).toBeCloseTo(240, 0);
    // The columns fill the frame.
    await expect(widthOf(table)).toBeCloseTo(scrollerOf(table).clientWidth, 0);

    // Region is the third cell along: after the selection checkbox and Service.
    const before = widthOf(heading('Region'));
    await userEvent.keyboard(toResizer(3));
    await expect(within(heading('Region')).getByRole('slider')).toHaveFocus();
    // Enter starts resizing, each Right widens it 10px, and Enter ends it.
    await userEvent.keyboard(
      '{Enter}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}',
    );
    await expect(widthOf(heading('Region'))).toBeCloseTo(before + 30, 0);
  },
};

const HeldWidths = (args: TableProps) => {
  const [widths, setWidths] = useState<Widths>(
    () => new Map([['service', 220]]),
  );
  const sizeOf = (id: keyof Deployment) => ({ width: widths.get(id) });
  return (
    <div className='flex flex-col gap-3'>
      <DeploymentTable
        {...args}
        allowsColumnResizing
        onResize={setWidths}
        sizes={{
          service: sizeOf('service'),
          region: sizeOf('region'),
          version: sizeOf('version'),
          owner: sizeOf('owner'),
          started: sizeOf('started'),
        }}
      />
      <p className='text-canvas-foreground-muted text-sm'>
        Service is {String(widths.get('service'))} wide. The app holds the
        widths, and stores them if it keeps them across visits.
      </p>
    </div>
  );
};

/**
 * Widths the app holds: each column's `width` from the app's state, which the table's `onResize`
 * sets with every column's width. Storing them across visits is the app's to do, with
 * `onResizeEnd`, which gives the same widths once a resize ends.
 */
export const ResizableWidthsHeldByTheApp: Story = {
  render: (args) => <HeldWidths {...args} />,
  play: async ({ canvas, userEvent }) => {
    // A heading's name also holds its resizer's value; match the heading by its text.
    const service = canvas.getByRole('columnheader', { name: /^Service/ });
    await expect(widthOf(service)).toBeCloseTo(220, 0);
    await userEvent.keyboard(toResizer(1));
    await expect(within(service).getByRole('slider')).toHaveFocus();
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}');
    await expect(widthOf(service)).toBeCloseTo(240, 0);
    await expect(canvas.getByText(/Service is 240 wide/)).toBeVisible();
  },
};
