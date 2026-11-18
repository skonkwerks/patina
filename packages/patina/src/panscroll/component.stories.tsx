import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { MediaStrip, MediaStripItem } from '../aria/mediastrip/index.js';
import { PanScroll } from './index.js';

/**
 * Picture stand-ins: real images (an inline SVG gradient each), so a drag that starts on a picture
 * pans as it would on an application's photos. Their colors are content, not theme colors.
 */
const gradients: [string, string][] = [
  ['#fcd34d', '#f43f5e'],
  ['#7dd3fc', '#2563eb'],
  ['#6ee7b7', '#15803d'],
  ['#fef08a', '#f97316'],
  ['#818cf8', '#0f172a'],
  ['#d9f99d', '#10b981'],
  ['#f0abfc', '#7e22ce'],
  ['#a5f3fc', '#0d9488'],
];

const pictureSource = ([from, to]: [string, string]) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`,
  )}`;

const PannedRow = ({ dir }: { dir?: 'ltr' | 'rtl' }) => {
  const strip = useRef<HTMLDivElement>(null);
  return (
    <div dir={dir}>
      <PanScroll target={strip} className='max-w-lg'>
        <MediaStrip
          ref={strip}
          aria-label='Pictures'
          orientation='horizontal'
          selectionMode='single'
          emptyState={{ title: 'No pictures yet' }}
        >
          {gradients.map((colors, index) => (
            <MediaStripItem
              key={colors.join()}
              id={colors.join()}
              title={`Picture ${index + 1}`}
              media={
                <img
                  alt=''
                  src={pictureSource(colors)}
                  className='size-full object-cover'
                />
              }
            />
          ))}
        </MediaStrip>
      </PanScroll>
    </div>
  );
};

const meta = {
  title: 'Core/PanScroll',
  component: PanScroll,
  render: () => <PannedRow />,
} satisfies Meta<typeof PanScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Drag the row with the mouse, from a picture or between them, and let go while moving: it glides
 * on and slows to a stop, and springs back past an end. A click still selects a tile, and a drag
 * leaves the selection as it was. The keyboard, the wheel, touch, and a trackpad scroll as they
 * always do. With reduced motion, a release stops where it is.
 */
export const WithMediaStripRow: Story = {
  args: { target: { current: null }, children: null },
};

/**
 * The same row in a right-to-left layout: the start is at the right, and a glide springs back
 * past either end as it does left to right.
 */
export const RightToLeft: Story = {
  args: { target: { current: null }, children: null },
  render: () => <PannedRow dir='rtl' />,
};
