import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconGripVertical } from '@tabler/icons-react';
import { useState } from 'react';
import {
  type DragAndDropOptions,
  isTextDropItem,
  useDragAndDrop,
  useListData,
} from 'react-aria-components';

import { IconButton } from '../iconbutton/index.js';
import { GridList, GridListItem } from './index.js';

/** What React Aria hands a drop on an item. */
type ItemDropEvent = Parameters<
  NonNullable<DragAndDropOptions['onItemDrop']>
>[0];

type Step = { id: string; name: string };

const steps: Step[] = [
  { id: 'draft', name: 'Draft the brief' },
  { id: 'review', name: 'Review with the team' },
  { id: 'design', name: 'Design the layout' },
  { id: 'publish', name: 'Publish' },
];

const ReorderableList = () => {
  const list = useListData({ initialItems: steps });
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({ 'text/plain': String(key) })),
    onReorder: (event) => {
      if (event.target.dropPosition === 'before') {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === 'after') {
        list.moveAfter(event.target.key, event.keys);
      }
    },
  });
  return (
    <GridList
      aria-label='Steps in order'
      emptyState={{ title: 'No steps' }}
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {(step) => (
        <GridListItem id={step.id} textValue={step.name}>
          <IconButton slot='drag' size='sm' aria-label={`Move ${step.name}`}>
            <IconGripVertical aria-hidden />
          </IconButton>
          {step.name}
        </GridListItem>
      )}
    </GridList>
  );
};

/**
 * A list that both reorders and takes drops onto its items, such as merging one step into another.
 * During a keyboard drag React Aria renders a hidden row before every item for the drop onto it,
 * and the insertion line still shows across it.
 */
const ReorderAndMergeList = () => {
  const list = useListData({ initialItems: steps });
  const [merged, setMerged] = useState('');
  const mergeInto = async (event: ItemDropEvent) => {
    const target = list.getItem(event.target.key);
    const keys = await Promise.all(
      event.items
        .filter(isTextDropItem)
        .map((item) => item.getText('text/plain')),
    );
    const moved = keys.filter((key) => key !== String(event.target.key));
    if (!target || moved.length === 0) {
      return;
    }
    list.remove(...moved);
    const count =
      moved.length === 1 ? 'one step' : `${String(moved.length)} steps`;
    setMerged(`Merged ${count} into "${target.name}"`);
  };
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({ 'text/plain': String(key) })),
    onReorder: (event) => {
      if (event.target.dropPosition === 'before') {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === 'after') {
        list.moveAfter(event.target.key, event.keys);
      }
    },
    // A drop on a row merges the dragged rows into it: they leave the list, and the status says so.
    // React Aria types the handler as returning nothing, so the merge runs as its own promise, and a
    // drop whose data cannot be read says so instead of failing silently.
    onItemDrop: (event) => {
      mergeInto(event).catch(() => {
        setMerged('The steps could not be merged.');
      });
    },
  });
  return (
    <div className='flex flex-col gap-2'>
      <GridList
        aria-label='Steps to reorder or merge'
        emptyState={{ title: 'No steps' }}
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
      >
        {(step) => (
          <GridListItem id={step.id} textValue={step.name}>
            <IconButton slot='drag' size='sm' aria-label={`Move ${step.name}`}>
              <IconGripVertical aria-hidden />
            </IconButton>
            {step.name}
          </GridListItem>
        )}
      </GridList>
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {merged}
      </p>
    </div>
  );
};

const meta = {
  title: 'Aria/Reorderable GridList',
  component: ReorderableList,
} satisfies Meta<typeof ReorderableList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A list reordered by dragging: React Aria's `useDragAndDrop`, a drag handle per row (also the
 * keyboard path: focus the handle and press Enter), and the shared insertion line, which `GridList`
 * supplies to any `dragAndDropHooks`: a primary line between the rows where the dragged row will
 * land. The rows never shift while it shows.
 */
export const Reorderable: Story = {};

/**
 * Reorders and takes drops onto rows: a drop between rows reorders (the insertion line), a drop on
 * a row (its dashed drop-target outline) merges the dragged rows into it, so they leave the list.
 */
export const ReorderAndDropOnItems: Story = {
  render: () => <ReorderAndMergeList />,
};
