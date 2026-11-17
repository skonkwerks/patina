import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconGripVertical, IconPhoto } from '@tabler/icons-react';
import { useState } from 'react';
import {
  type Selection,
  useDragAndDrop,
  useListData,
} from 'react-aria-components';

import { IconMark } from '../../iconmark/index.ts';
import { InlineMetadata } from '../../inlinemetadata/index.ts';
import { IconButton } from '../iconbutton/index.ts';
import { MediaStrip, MediaStripItem, type MediaStripProps } from './index.ts';

type Picture = {
  id: string;
  title: string;
  size: string;
  colors: [string, string];
};

/**
 * Picture stand-ins: real images (an inline SVG gradient each), so a drag on a picture behaves as
 * it does on an application's photos, and the stories need no image files. Their colors are
 * content, not theme colors.
 */
const pictures: Picture[] = [
  {
    id: 'dawn',
    title: 'Dawn over the ridge',
    size: '1024 × 1024',
    colors: ['#fcd34d', '#f43f5e'],
  },
  {
    id: 'harbor',
    title: 'Harbor at noon',
    size: '1536 × 1024',
    colors: ['#7dd3fc', '#2563eb'],
  },
  {
    id: 'forest',
    title: 'Forest path',
    size: '1024 × 1536',
    colors: ['#6ee7b7', '#15803d'],
  },
  {
    id: 'dunes',
    title: 'Dunes',
    size: '1024 × 1024',
    colors: ['#fef08a', '#f97316'],
  },
  {
    id: 'night',
    title: 'City at night',
    size: '2048 × 1024',
    colors: ['#818cf8', '#0f172a'],
  },
  {
    id: 'meadow',
    title: 'Meadow',
    size: '1024 × 1024',
    colors: ['#d9f99d', '#10b981'],
  },
];

/**
 * A picture as an image, as an application's photos are, so a drag that starts on it is tested
 * (`Media` sets `draggable={false}`, as a reorderable strip's pictures must).
 */
const pictureSource = ([from, to]: [string, string]) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`,
  )}`;

/** The tile's title names it, so the picture itself is decorative. */
const Media = ({ colors }: { colors: [string, string] }) => (
  <img
    alt=''
    src={pictureSource(colors)}
    draggable={false}
    className='size-full object-cover'
  />
);

const tiles = (isCompact = false) =>
  pictures.map((picture) => (
    <MediaStripItem
      key={picture.id}
      id={picture.id}
      title={picture.title}
      media={<Media colors={picture.colors} />}
      isCompact={isCompact}
      endContent={
        <IconMark aria-label='Photo'>
          <IconPhoto aria-hidden />
        </IconMark>
      }
      description={
        <InlineMetadata items={[{ id: 'size', value: picture.size }]} />
      }
    />
  ));

const empty = {
  title: 'No pictures yet',
  description: 'Pictures you add appear here.',
};

const meta = {
  title: 'Aria/MediaStrip',
  component: MediaStrip,
  args: { 'aria-label': 'Pictures', emptyState: empty, children: tiles() },
} satisfies Meta<typeof MediaStrip>;

export default meta;
type Story = StoryObj<MediaStripProps<object>>;

/**
 * Vertical, the default: wrapping square tiles that share the row, each with a caption, an end
 * mark, and a description.
 */
export const Wrap: Story = {};

/**
 * Horizontal: one row that scrolls sideways, and the arrow and page keys move along it. The
 * scrollbar stays visible, so the tiles past the edge are noticed.
 */
export const Row: Story = {
  args: { orientation: 'horizontal' },
  render: (args: MediaStripProps<object>) => (
    <div className='max-w-lg'>
      <MediaStrip {...args} />
    </div>
  ),
};

/** A chosen tile width, as from a size control. */
export const TileWidth: Story = { args: { tileWidth: 96 } };

/**
 * Compact tiles: the picture alone, with the caption over its bottom edge while a tile is hovered
 * or holds the focus, and always on a touch screen. The title is always the tile's name, and the
 * description stays the tile's description to assistive technology.
 */
export const Compact: Story = {
  args: { tileWidth: 96, children: tiles(true) },
};

const SelectableStrip = () => {
  const [selected, setSelected] = useState<Selection>(
    () => new Set(['harbor']),
  );
  return (
    <MediaStrip
      aria-label='Pictures'
      emptyState={empty}
      selectionMode='multiple'
      selectedKeys={selected}
      onSelectionChange={setSelected}
    >
      {tiles()}
    </MediaStrip>
  );
};

/** Multiple selection: React Aria's grid keyboard and pointer selection, with the shared tile states. */
export const Selectable: Story = { render: () => <SelectableStrip /> };

/** Loaded and empty: the empty state spans the whole frame. */
export const Empty: Story = { args: { children: [] } };

/** The first load in flight. */
export const Pending: Story = {
  args: { children: [], isPending: true, pendingText: 'Loading pictures' },
};

/** An ordered strip: each tile's position before its title, in the caption line. */
export const Numbered: Story = {
  args: {
    children: pictures.map((picture, index) => (
      <MediaStripItem
        key={picture.id}
        id={picture.id}
        title={picture.title}
        media={<Media colors={picture.colors} />}
        startContent={<span className='tabular-nums'>{index + 1}</span>}
      />
    )),
  },
};

const ReorderableStrip = () => {
  const list = useListData({ initialItems: pictures });
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
    <MediaStrip
      aria-label='Pictures in order'
      emptyState={empty}
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {(picture) => (
        <MediaStripItem
          id={picture.id}
          title={picture.title}
          media={<Media colors={picture.colors} />}
          startContent={
            <span className='tabular-nums'>
              {list.items.indexOf(picture) + 1}
            </span>
          }
          dragHandle={
            <IconButton
              slot='drag'
              size='sm'
              aria-label={`Move ${picture.title}`}
            >
              <IconGripVertical aria-hidden />
            </IconButton>
          }
        />
      )}
    </MediaStrip>
  );
};

/**
 * Reordered by dragging: React Aria's `useDragAndDrop`, with each tile's drag handle (also the
 * keyboard path: focus the handle and press Enter) and its position updating as the order changes.
 * Not wrapped by `PanScroll`, where a drag would pan instead.
 */
export const Reorderable: Story = { render: () => <ReorderableStrip /> };
