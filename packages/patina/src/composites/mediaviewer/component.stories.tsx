import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useId, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.ts';
import { DialogTrigger } from '../../aria/dialog/index.ts';
import { TextField } from '../../aria/textfield/index.ts';
import { IconToggle } from '../../aria/togglegroup/index.ts';
import { pressTab } from '../../internal/keyboard.testing.ts';
import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.ts';
import { useCarouselState } from '../carousel/index.ts';
import {
  carouselText,
  type Picture,
  pictures,
} from '../carousel/pictures.testing.ts';
import { PictureSlide, PictureThumbnail } from '../carousel/slides.testing.tsx';
import { MediaViewer, MediaViewerDialog } from './index.ts';

/**
 * A picture's longer text, of different lengths from picture to picture: some fit the details
 * area, and some scroll in it.
 */
const details = (picture: Picture) =>
  Array.from(
    { length: (Number(picture.id.replace(/\D/g, '')) % 4) * 3 + 2 },
    () =>
      `${picture.title} was drawn at ${picture.width} by ${picture.height}, a gradient with its number in the middle.`,
  ).join(' ');

/** The favorite toggle a picture's actions hold, drawn for whichever picture is shown. */
const FavoriteToggle = ({
  picture,
  favorites,
  onFavoritesChange,
}: {
  picture: Picture;
  favorites: ReadonlySet<string>;
  onFavoritesChange: (favorites: ReadonlySet<string>) => void;
}) => (
  <IconToggle
    aria-label='Favorite'
    isSelected={favorites.has(picture.id)}
    onChange={(isSelected) => {
      const next = new Set(favorites);
      if (isSelected) {
        next.add(picture.id);
      } else {
        next.delete(picture.id);
      }
      onFavoritesChange(next);
    }}
  >
    {({ isSelected }) =>
      isSelected ? (
        <IconHeartFilled aria-hidden className='size-4' />
      ) : (
        <IconHeart aria-hidden className='size-4' />
      )
    }
  </IconToggle>
);

type InlineViewerProps = {
  /** The heading over the viewer, which names it. */
  title?: string;
  /** The number of the set's first picture. */
  from?: number;
};

/**
 * A media viewer on a page, named by the heading of its section over it (`aria-labelledby`), and
 * holding where it is itself.
 */
const InlineViewer = ({ title = 'Gallery', from = 1 }: InlineViewerProps) => {
  const headingId = useId();
  const items = pictures(8, from);
  const state = useCarouselState({ items });
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  return (
    <section className='flex max-w-3xl flex-col gap-4'>
      <h2
        id={headingId}
        className='text-canvas-foreground text-lg font-semibold'
      >
        {title}
      </h2>
      <MediaViewer
        {...carouselText}
        state={state}
        aria-labelledby={headingId}
        shape={{ width: 4, height: 3 }}
        renderSlide={(picture) => <PictureSlide picture={picture} />}
        renderCaption={(picture) => picture.title}
        renderActions={(picture) => (
          <FavoriteToggle
            picture={picture}
            favorites={favorites}
            onFavoritesChange={setFavorites}
          />
        )}
        renderDetails={(picture) => <p>{details(picture)}</p>}
      />
    </section>
  );
};

type GalleryDialogProps = {
  count?: number;
  hasIndicator?: boolean;
};

/**
 * A button that opens a media viewer in a dialog on the third picture. A picture's actions hold
 * its favorite toggle, and its details a note, a text field whose caret takes the arrow keys, above
 * its longer text; the caller gives the details a taller area for it.
 */
const GalleryDialog = ({
  count = 8,
  hasIndicator = false,
}: GalleryDialogProps) => {
  const items = pictures(count);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [notes, setNotes] = useState<Readonly<Record<string, string>>>({});
  return (
    <DialogTrigger>
      <Button variant='solid' tone='primary'>
        Open the gallery
      </Button>
      <MediaViewerDialog
        {...carouselText}
        items={items}
        defaultCurrentId='picture-3'
        title='Gallery'
        closeLabel='Close'
        fullScreenLabel='Full screen'
        shape={{ width: 4, height: 3 }}
        renderSlide={(picture) => <PictureSlide picture={picture} />}
        renderCaption={(picture) => picture.title}
        renderActions={(picture) => (
          <FavoriteToggle
            picture={picture}
            favorites={favorites}
            onFavoritesChange={setFavorites}
          />
        )}
        renderDetails={(picture) => (
          <div className='flex flex-col gap-3'>
            <TextField
              label='Note'
              value={notes[picture.id] ?? ''}
              onChange={(note) => setNotes({ ...notes, [picture.id]: note })}
              className='max-w-sm'
            />
            <p>{details(picture)}</p>
          </div>
        )}
        className='[--media-viewer-details-height:9rem]'
        indicator={
          hasIndicator
            ? {
                scrubberLabel: 'Picture',
                renderThumbnail: (picture) => (
                  <PictureThumbnail picture={picture} />
                ),
              }
            : undefined
        }
      />
    </DialogTrigger>
  );
};

/**
 * Waits until React Aria's live announcer lets go of the dialog it announced, which is gone once
 * the dialog has closed (see `LIVE_ANNOUNCER_MESSAGE`).
 */
const announcerCleared = async (document: Document) =>
  waitFor(
    async () => {
      await expect(document.querySelector(LIVE_ANNOUNCER_MESSAGE)).toBeNull();
    },
    { timeout: LIVE_ANNOUNCER_CLEAR_MS },
  );

/** The frame a viewer's slides slide in. */
const frameIn = (viewer: HTMLElement) => {
  const slide = viewer.querySelector('[aria-roledescription="slide"]');
  const frame = slide?.parentElement?.parentElement;
  if (!frame) {
    throw new Error('The viewer has no frame.');
  }
  return frame;
};

const meta = {
  title: 'Composites/MediaViewer',
  component: InlineViewer,
} satisfies Meta<typeof InlineViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The viewer's own area: the carousel's parent, holding its caption line and details too. */
const viewerOf = (carousel: HTMLElement) => {
  const viewer = carousel.parentElement;
  if (!viewer) {
    throw new Error('The carousel stands in no viewer.');
  }
  return viewer;
};

/**
 * Inline, under the heading of its section, which names it: the carousel, then the picture's
 * caption and its actions on one line, and its longer text in an area of one height that scrolls.
 * The frame keeps its size while the pictures turn, whatever the length of their text.
 */
export const Inline: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const viewer = within(canvasElement).getByRole('region', {
      name: 'Gallery',
    });
    await expect(viewer).toHaveAttribute(
      'aria-labelledby',
      canvas.getByRole('heading', { name: 'Gallery' }).id,
    );
    const frame = frameIn(viewer);
    await expect(canvas.getByText('Picture 1')).toBeVisible();
    const size = frame.getBoundingClientRect();

    // The actions are drawn for the picture shown, each taking its value from that picture.
    await userEvent.click(canvas.getByRole('button', { name: 'Favorite' }));
    await expect(
      canvas.getByRole('button', { name: 'Favorite' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('Picture 2')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Favorite' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('Picture 3')).toBeVisible();
    await expect(frame.getBoundingClientRect().width).toBe(size.width);
    await expect(frame.getBoundingClientRect().height).toBe(size.height);

    // The third picture's text is longer than its area, which scrolls and takes the focus.
    const text = canvas.getByText(/^Picture 3 was drawn/);
    const area = text.parentElement;
    if (!area) {
      throw new Error('The details have no area.');
    }
    await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
    area.focus();
    await expect(area).toHaveFocus();
  },
};

/**
 * Inline as in a dialog, the arrow keys turn a viewer while the focus is anywhere in it, on an
 * action of its caption line or in its details as well as in its carousel. Two viewers on a page
 * each take only their own.
 */
export const InlineKeys: Story = {
  render: () => (
    <div className='flex flex-col gap-8'>
      <InlineViewer title='Kitchen' />
      <InlineViewer title='Garden' from={9} />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const kitchen = within(canvasElement).getByRole('region', {
      name: 'Kitchen',
    });
    const garden = within(canvasElement).getByRole('region', {
      name: 'Garden',
    });
    const kitchenStatus = within(kitchen).getByRole('status');
    const gardenStatus = within(garden).getByRole('status');

    await userEvent.click(
      within(viewerOf(kitchen)).getByRole('button', { name: 'Favorite' }),
    );
    await userEvent.keyboard('{ArrowRight}');
    await expect(kitchenStatus).toHaveTextContent('2 of 8');
    await expect(gardenStatus).toHaveTextContent('1 of 8');

    const gardenDetails = within(viewerOf(garden)).getByText(
      /^Picture 9 was drawn/,
    ).parentElement;
    if (!gardenDetails) {
      throw new Error('The details have no area.');
    }
    gardenDetails.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(gardenStatus).toHaveTextContent('2 of 8');
    await expect(kitchenStatus).toHaveTextContent('2 of 8');
  },
};

/**
 * In a dialog, opened on the third picture: the dialog's title names it, with full screen beside
 * the close control. The arrow keys turn it while the focus is anywhere in the dialog (on the
 * dialog as it opens, on full screen), but not in the note's text field, whose caret takes them.
 * Escape closes it, and the focus returns to what opened it.
 */
export const InADialog: Story = {
  render: () => <GalleryDialog />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const page = within(document.body);
    const opener = canvas.getByRole('button', { name: 'Open the gallery' });
    await userEvent.click(opener);
    const dialog = await page.findByRole('dialog', { name: 'Gallery' });
    const status = within(dialog).getByRole('status');
    await expect(status).toHaveTextContent('3 of 8');
    await expect(within(dialog).getByText('Picture 3')).toBeVisible();

    await waitFor(async () => {
      await expect(dialog).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('4 of 8');

    pressTab(document);
    await expect(
      within(dialog).getByRole('button', { name: 'Full screen' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(status).toHaveTextContent('3 of 8');

    const note = within(dialog).getByRole('textbox', { name: 'Note' });
    await userEvent.click(note);
    await userEvent.keyboard('Soft light');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(status).toHaveTextContent('3 of 8');
    await expect(note).toHaveValue('Soft light');

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(async () => {
      await expect(opener).toHaveFocus();
    });
    await announcerCleared(document);
  },
};

/**
 * Full screen makes the dialog fill the window, and pressed again gives it back its size. A dialog
 * closed in full screen opens again at its own size.
 */
export const FullScreen: Story = {
  render: () => <GalleryDialog />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView;
    const page = within(document.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open the gallery' }),
    );
    const dialog = await page.findByRole('dialog', { name: 'Gallery' });
    const modal = dialog.parentElement;
    if (!modal || !window) {
      throw new Error('The dialog has no modal.');
    }
    const fullScreen = within(dialog).getByRole('button', {
      name: 'Full screen',
    });
    const frame = frameIn(dialog);
    const frameWidth = frame.getBoundingClientRect().width;

    await userEvent.click(fullScreen);
    await expect(fullScreen).toHaveAttribute('aria-pressed', 'true');
    await waitFor(async () => {
      await expect(modal.getBoundingClientRect().width).toBe(window.innerWidth);
    });
    await expect(modal.getBoundingClientRect().height).toBe(window.innerHeight);
    await expect(frame.getBoundingClientRect().width).toBeGreaterThan(
      frameWidth,
    );

    await userEvent.click(fullScreen);
    await expect(fullScreen).toHaveAttribute('aria-pressed', 'false');
    await waitFor(async () => {
      await expect(modal.getBoundingClientRect().width).toBeLessThan(
        window.innerWidth,
      );
    });

    // Closed in full screen, it opens again at its own size.
    await userEvent.click(fullScreen);
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open the gallery' }),
    );
    const reopened = await page.findByRole('dialog', { name: 'Gallery' });
    await expect(
      within(reopened).getByRole('button', { name: 'Full screen' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(
      reopened.parentElement?.getBoundingClientRect().width,
    ).toBeLessThan(window.innerWidth);
  },
};

/**
 * A larger set in a dialog, with the indicator: past nine pictures, the scrubber under the frame,
 * which previews a picture under the pointer and turns the viewer when it is let go.
 */
export const DialogWithScrubber: Story = {
  render: () => <GalleryDialog count={30} hasIndicator />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open the gallery' }),
    );
    const dialog = await page.findByRole('dialog', { name: 'Gallery' });
    const scrubber = within(dialog).getByRole('slider', { name: 'Picture' });
    await expect(scrubber).toHaveValue('3');
    await expect(within(dialog).getByRole('status')).toHaveTextContent(
      '3 of 30',
    );
  },
};

/** Shapes far apart, which a picture of each sits whole in the frame with: wide, square, tall. */
const mixedShapes: readonly (readonly [number, number])[] = [
  [21, 9],
  [1, 1],
  [9, 16],
];

/**
 * Six pictures of the three shapes in turn, with texts of different lengths, and one caption long
 * enough to be cut at the end of its line.
 */
const mixedPictures: readonly Picture[] = pictures(6).map((picture, index) => {
  const [width, height] = mixedShapes[index % mixedShapes.length] ?? [1, 1];
  return {
    ...picture,
    width,
    height,
    title:
      index === 4
        ? `${picture.title}, the long way round the harbor at dusk, as the lights come on one by one along the quay`
        : picture.title,
  };
});

/** A button that opens the mixed pictures in a viewer dialog, of the size `className` gives it. */
const MixedDialog = ({ className }: { className?: string }) => (
  <DialogTrigger>
    <Button variant='solid' tone='primary'>
      Open the pictures
    </Button>
    <MediaViewerDialog
      {...carouselText}
      items={mixedPictures}
      title='Pictures'
      closeLabel='Close'
      fullScreenLabel='Full screen'
      renderSlide={(picture) => <PictureSlide picture={picture} />}
      renderCaption={(picture) => picture.title}
      renderDetails={(picture) => <p>{details(picture)}</p>}
      className={className}
    />
  </DialogTrigger>
);

/** Where an element stands on the page. */
const boxOf = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
};

/** The modal around a dialog, which is its box. */
const modalOf = (dialog: HTMLElement) => {
  const modal = dialog.parentElement;
  if (!modal) {
    throw new Error('The dialog stands in no modal.');
  }
  return modal;
};

/** The picture a viewer shows: the image in its one slide that is not inert. */
const shownPicture = (viewer: HTMLElement) => {
  const image = viewer
    .querySelector('[aria-roledescription="slide"]:not([inert])')
    ?.querySelector('img');
  if (!image) {
    throw new Error('The viewer shows no picture.');
  }
  return image;
};

/**
 * Where a picture drawn with `object-fit: contain` stands: the largest box of its own shape inside
 * its element, centered.
 */
const drawnBoxOf = (image: HTMLImageElement) => {
  const element = image.getBoundingClientRect();
  const scale = Math.min(
    element.width / image.naturalWidth,
    element.height / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  return {
    left: element.left + (element.width - width) / 2,
    top: element.top + (element.height - height) / 2,
    right: element.left + (element.width + width) / 2,
    bottom: element.top + (element.height + height) / 2,
  };
};

/**
 * The dialog does not fit its picture. Turned through pictures that are wide, square, and tall,
 * with captions and texts of different lengths, its box stays Patina's default, the window's 90%
 * in height and up to 72rem wide, and neither it, nor the frame, nor Previous and Next move; each
 * picture sits whole inside the frame, with bars where its shape differs.
 */
export const OneBoxForEveryPicture: Story = {
  render: () => <MixedDialog />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView;
    if (window === null) {
      throw new Error('The story has no window.');
    }
    const page = within(document.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open the pictures' }),
    );
    const dialog = await page.findByRole('dialog', { name: 'Pictures' });
    await waitFor(async () => {
      await expect(dialog).toHaveFocus();
    });
    const status = within(dialog).getByRole('status');
    const previous = within(dialog).getByRole('button', { name: 'Previous' });
    const next = within(dialog).getByRole('button', { name: 'Next' });
    const frame = frameIn(dialog);

    const modal = boxOf(modalOf(dialog));
    await expect(
      Math.abs(modal.height - window.innerHeight * 0.9),
    ).toBeLessThan(1);
    await expect(
      Math.abs(modal.width - Math.min(window.innerWidth - 32, 1152)),
    ).toBeLessThan(1);
    const first = {
      modal,
      previous: boxOf(previous),
      next: boxOf(next),
      frame: boxOf(frame),
    };

    for (let position = 1; position <= mixedPictures.length; position += 1) {
      await expect(status).toHaveTextContent(
        `${position} of ${mixedPictures.length}`,
      );
      // At rest: the picture shown stands exactly in the frame, and its image has loaded.
      await waitFor(
        async () => {
          const image = shownPicture(dialog);
          await expect(image.naturalWidth).toBeGreaterThan(0);
          await expect(
            Math.abs(image.getBoundingClientRect().left - boxOf(frame).x),
          ).toBeLessThan(0.1);
        },
        { timeout: 3000 },
      );
      await expect(boxOf(modalOf(dialog))).toEqual(first.modal);
      await expect(boxOf(previous)).toEqual(first.previous);
      await expect(boxOf(next)).toEqual(first.next);
      await expect(boxOf(frame)).toEqual(first.frame);

      const image = shownPicture(dialog);
      await expect(getComputedStyle(image).objectFit).toBe('contain');
      const drawn = drawnBoxOf(image);
      const bounds = frame.getBoundingClientRect();
      await expect(drawn.left).toBeGreaterThanOrEqual(bounds.left - 0.5);
      await expect(drawn.top).toBeGreaterThanOrEqual(bounds.top - 0.5);
      await expect(drawn.right).toBeLessThanOrEqual(bounds.right + 0.5);
      await expect(drawn.bottom).toBeLessThanOrEqual(bounds.bottom + 0.5);

      if (position < mixedPictures.length) {
        await userEvent.keyboard('{ArrowRight}');
      }
    }
  },
};

/**
 * The app chooses the dialog's size: here `h-[70vh] max-w-3xl` in its `className`, which replaces
 * Patina's default, and the dialog keeps that box from one picture to the next.
 */
export const AppSetSize: Story = {
  render: () => <MixedDialog className='h-[70vh] max-w-3xl' />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView;
    if (window === null) {
      throw new Error('The story has no window.');
    }
    const page = within(document.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open the pictures' }),
    );
    const dialog = await page.findByRole('dialog', { name: 'Pictures' });
    await waitFor(async () => {
      await expect(dialog).toHaveFocus();
    });
    const modal = boxOf(modalOf(dialog));
    await expect(
      Math.abs(modal.height - window.innerHeight * 0.7),
    ).toBeLessThan(1);
    await expect(
      Math.abs(modal.width - Math.min(window.innerWidth - 32, 768)),
    ).toBeLessThan(1);

    await userEvent.keyboard('{ArrowRight}');
    await expect(within(dialog).getByRole('status')).toHaveTextContent(
      `2 of ${mixedPictures.length}`,
    );
    await expect(boxOf(modalOf(dialog))).toEqual(modal);
  },
};
