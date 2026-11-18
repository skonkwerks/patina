import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.js';
import { pressTab } from '../../internal/keyboard.testing.js';
import { AFTER_RELEASE_MS, dragSideways } from './drag.testing.js';
import { Carousel, useCarouselState } from './index.js';
import {
  carouselText,
  type Picture,
  pictures,
  video,
} from './pictures.testing.js';
import { PictureSlide, PictureThumbnail } from './slides.testing.js';

type PictureCarouselProps = {
  /** The carousel's name. */
  label?: string;
  items?: readonly Picture[];
  /** The dots, or the scrubber past nine. */
  hasIndicator?: boolean;
  allowsDragging?: boolean;
  /** Draws a button in each slide that opens its picture, something in a slide that takes presses. */
  hasSlideButtons?: boolean;
  /** What a slide's button does. */
  onOpen?: (picture: Picture) => void;
};

/** A carousel of pictures, in a 4:3 frame, holding where it is itself. */
const PictureCarousel = ({
  label = 'Pictures',
  items = pictures(6),
  hasIndicator = false,
  allowsDragging,
  hasSlideButtons = false,
  onOpen,
}: PictureCarouselProps) => {
  const state = useCarouselState({ items });
  return (
    <Carousel
      {...carouselText}
      state={state}
      aria-label={label}
      shape={{ width: 4, height: 3 }}
      allowsDragging={allowsDragging}
      renderSlide={(picture) =>
        hasSlideButtons ? (
          <div className='relative size-full'>
            <PictureSlide picture={picture} />
            <Button
              className='absolute end-2 bottom-2'
              onPress={() => onOpen?.(picture)}
            >
              {`Open ${picture.title}`}
            </Button>
          </div>
        ) : (
          <PictureSlide picture={picture} />
        )
      }
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
      className='max-w-xl'
    />
  );
};

/** The carousel named `name` on the page. */
const carouselNamed = (canvasElement: HTMLElement, name = 'Pictures') =>
  within(canvasElement).getByRole('region', { name });

/** The slides a carousel has drawn: the current one and its neighbors. */
const drawnSlides = (carousel: HTMLElement) => [
  ...carousel.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]'),
];

/** The slide a carousel shows: the one drawn slide that is not inert. */
const currentSlide = (carousel: HTMLElement) => {
  const slide = drawnSlides(carousel).find(
    (element) => !element.hasAttribute('inert'),
  );
  if (slide === undefined) {
    throw new Error('The carousel shows no slide.');
  }
  return slide;
};

/** The frame the slides slide in: the parent of the strip that holds them. */
const frameOf = (carousel: HTMLElement) => {
  const frame = currentSlide(carousel).parentElement?.parentElement;
  if (!frame) {
    throw new Error('The carousel has no frame.');
  }
  return frame;
};

/**
 * Waits until the frame has been measured, so the strip is shown and can be dragged, and the slide
 * shown stands exactly in its frame, as it does at rest.
 */
const settled = (carousel: HTMLElement) =>
  waitFor(
    async () => {
      const slide = currentSlide(carousel);
      const strip = slide.parentElement;
      await expect(strip && getComputedStyle(strip).opacity).toBe('1');
      const offset =
        slide.getBoundingClientRect().left -
        frameOf(carousel).getBoundingClientRect().left;
      await expect(Math.abs(offset)).toBeLessThan(1);
    },
    { timeout: 3000 },
  );

/** Waits out what a press may still do after the pointer is released, such as React Aria's own click. */
const afterRelease = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, AFTER_RELEASE_MS);
  });

/** How long a turn is watched: longer than its spring takes to settle. */
const TURN_MS = 1000;

/**
 * How much of the frame the spring may leave bare past an end of the set as it settles, as a
 * fraction of its width: it overshoots its target a little, as on any turn to an end, and as much
 * as a drag gives there.
 */
const SETTLING_GIVE = 0.1;

/**
 * Watches the frame on every animation frame for `TURN_MS`, from just after a turn: the slides
 * drawn cover it throughout, but for the sliver the spring may leave past an end as it settles.
 */
const coveredThroughout = async (carousel: HTMLElement) => {
  const window = carousel.ownerDocument.defaultView;
  if (window === null) {
    throw new Error('The carousel is not in a window.');
  }
  const end = window.performance.now() + TURN_MS;
  while (window.performance.now() < end) {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
    const frame = frameOf(carousel).getBoundingClientRect();
    const slides = drawnSlides(carousel).map((slide) =>
      slide.getBoundingClientRect(),
    );
    const left = Math.min(...slides.map((slide) => slide.left));
    const right = Math.max(...slides.map((slide) => slide.right));
    const bare =
      Math.max(left - frame.left, 0) + Math.max(frame.right - right, 0);
    await expect(bare).toBeLessThanOrEqual(frame.width * SETTLING_GIVE);
  }
};

const meta = {
  title: 'Composites/Carousel',
  component: PictureCarousel,
} satisfies Meta<typeof PictureCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Inline on a page: a region named by the app, with its slides in a 4:3 frame between Previous
 * and Next, and where it is in words under it, announced as it turns. Only the current slide and
 * its neighbors are drawn, and the neighbors are inert. A picture of another shape sits whole in
 * the frame with bars.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const carousel = carouselNamed(canvasElement);
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    const status = within(carousel).getByRole('status');
    await expect(status).toHaveTextContent('1 of 6');

    const first = currentSlide(carousel);
    await expect(first).toHaveAttribute('aria-roledescription', 'slide');
    await expect(first).toHaveAccessibleName('1 of 6');
    await expect(drawnSlides(carousel)).toHaveLength(2);
    await expect(drawnSlides(carousel)[1]).toHaveAttribute('inert');

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(status).toHaveTextContent('2 of 6');
    await expect(currentSlide(carousel)).toHaveAccessibleName('2 of 6');
    await expect(drawnSlides(carousel)).toHaveLength(3);
    await settled(carousel);

    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(status).toHaveTextContent('1 of 6');
    await settled(carousel);
  },
};

/** With the indicator, a set of up to nine has a dot for each slide, decoration beside the words. */
export const WithDots: Story = {
  args: { hasIndicator: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    const dots = status.nextElementSibling;
    await expect(dots).toHaveAttribute('aria-hidden', 'true');
    await expect(dots?.children).toHaveLength(6);
    await expect(dots?.children[0]).toHaveClass('bg-primary');

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(status).toHaveTextContent('2 of 6');
    await expect(dots?.children[0]).not.toHaveClass('bg-primary');
    await expect(dots?.children[1]).toHaveClass('bg-primary');
  },
};

/**
 * Past nine, the indicator is a scrubber, whose value is the position in the app's words. With the
 * pointer over its track, the slide under it is previewed above it, and the carousel stays where it
 * is; it turns when a drag ends or a key moves the thumb, one slide for each arrow. While the
 * scrubber holds the focus, its value says where the carousel is, and the status line is not
 * announced as well.
 */
export const WithScrubber: Story = {
  args: { hasIndicator: true, items: pictures(24) },
  play: async ({ canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    const scrubber = within(carousel).getByRole('slider', { name: 'Picture' });
    await expect(scrubber).toHaveValue('1');
    await expect(scrubber).toHaveAttribute('aria-valuetext', '1 of 24');
    await expect(status).toHaveAttribute('aria-live', 'polite');

    // Over the middle of the track, the 13th picture is previewed; nothing turns.
    const track = within(carousel).getByRole('group', {
      name: 'Picture',
    }).firstElementChild;
    if (!(track instanceof HTMLElement)) {
      throw new Error('The scrubber has no track.');
    }
    const box = track.getBoundingClientRect();
    await userEvent.pointer({
      target: track,
      coords: { clientX: box.left + box.width / 2, clientY: box.top + 4 },
    });
    await expect(await within(carousel).findByText('13 of 24')).toBeVisible();
    await expect(status).toHaveTextContent('1 of 24');
    await expect(scrubber).toHaveValue('1');
    await userEvent.unhover(track);
    await waitFor(async () => {
      await expect(
        within(carousel).queryByText('13 of 24'),
      ).not.toBeInTheDocument();
    });

    // From the keyboard: Previous, Next, then the scrubber.
    pressTab(document);
    pressTab(document);
    pressTab(document);
    await expect(scrubber).toHaveFocus();
    await expect(status).toHaveAttribute('aria-live', 'off');
    await userEvent.keyboard('{End}');
    await expect(status).toHaveTextContent('24 of 24');
    await expect(scrubber).toHaveAttribute('aria-valuetext', '24 of 24');
    await expect(currentSlide(carousel)).toHaveAccessibleName('24 of 24');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(status).toHaveTextContent('23 of 24');
    await expect(scrubber).toHaveValue('23');
    await expect(scrubber).toHaveAttribute('aria-valuetext', '23 of 24');

    // Away from the scrubber, the status is announced again.
    pressTab(document, { isShift: true });
    await expect(
      within(carousel).getByRole('button', { name: 'Next' }),
    ).toHaveFocus();
    await expect(status).toHaveAttribute('aria-live', 'polite');
  },
};

type StoryContext = Parameters<NonNullable<Story['play']>>[0];

/**
 * Turns a carousel of 24 by its scrubber's End and Home, and by a press and release three quarters
 * along the scrubber's track from its left edge, which names `releasedAt`: the frame stays covered
 * by drawn slides throughout each turn.
 */
const turnFar = async (
  { canvasElement, userEvent }: StoryContext,
  releasedAt: number,
) => {
  const carousel = carouselNamed(canvasElement);
  const status = within(carousel).getByRole('status');
  const scrubber = within(carousel).getByRole('slider', { name: 'Picture' });
  await settled(carousel);

  scrubber.focus();
  await userEvent.keyboard('{End}');
  await coveredThroughout(carousel);
  await expect(status).toHaveTextContent('24 of 24');
  await settled(carousel);

  await userEvent.keyboard('{Home}');
  await coveredThroughout(carousel);
  await expect(status).toHaveTextContent('1 of 24');
  await settled(carousel);

  const track = within(carousel).getByRole('group', {
    name: 'Picture',
  }).firstElementChild;
  if (!(track instanceof HTMLElement)) {
    throw new Error('The scrubber has no track.');
  }
  const box = track.getBoundingClientRect();
  const coords = {
    clientX: box.left + box.width * 0.75,
    clientY: box.top + box.height / 2,
  };
  await userEvent.pointer([
    { keys: '[MouseLeft>]', target: track, coords },
    { keys: '[/MouseLeft]', target: track, coords },
  ]);
  await coveredThroughout(carousel);
  await expect(status).toHaveTextContent(`${releasedAt} of 24`);
};

/**
 * A turn of many slides at once (the scrubber's End or Home, a release far along it): only the
 * slide chosen and its neighbors are drawn, so the strip starts from the neighbor on the side it
 * comes from and slides the last width in, as on a single turn. The frame never shows its bare
 * canvas or a slide from the middle of the set on the way.
 */
export const FarTurns: Story = {
  args: { hasIndicator: true, items: pictures(24) },
  // Three quarters along from the left: the 18th picture.
  play: (context) => turnFar(context, 18),
};

/** The same far turns right to left, where the slides run from the right. */
export const FarTurnsRightToLeft: Story = {
  args: { hasIndicator: true, items: pictures(24) },
  render: (args) => (
    <I18nProvider locale='ar-EG'>
      <div dir='rtl'>
        <PictureCarousel {...args} />
      </div>
    </I18nProvider>
  ),
  // Three quarters along from the left is a quarter along from the start: the 7th picture.
  play: (context) => turnFar(context, 7),
};

/** A carousel over a set the page changes: a picture is added at the start, or the one shown removed. */
const ChangingCarousel = () => {
  const [items, setItems] = useState(() => pictures(6));
  const [nextNumber, setNextNumber] = useState(101);
  const state = useCarouselState({ items, defaultCurrentId: 'picture-3' });
  return (
    <div className='flex flex-col items-start gap-3'>
      <Carousel
        {...carouselText}
        state={state}
        aria-label='Pictures'
        shape={{ width: 4, height: 3 }}
        renderSlide={(picture) => <PictureSlide picture={picture} />}
        className='w-full max-w-xl'
      />
      <div className='flex gap-2'>
        <Button
          onPress={() => {
            setItems((list) => [...pictures(1, nextNumber), ...list]);
            setNextNumber((number) => number + 1);
          }}
        >
          Add a picture at the start
        </Button>
        <Button
          onPress={() =>
            setItems((list) =>
              list.filter((picture) => picture.id !== state.current?.id),
            )
          }
        >
          Remove the picture shown
        </Button>
      </div>
    </div>
  );
};

/**
 * The set changes under the carousel. A picture added before the one shown does not turn the
 * page: the carousel stays on its picture, now one place further. When the picture shown is
 * removed, the one now at its place is shown, and followed from there.
 */
export const ChangingSet: Story = {
  render: () => <ChangingCarousel />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    const shownPicture = () =>
      within(currentSlide(carousel)).getByRole('img').getAttribute('alt');
    await expect(status).toHaveTextContent('3 of 6');
    await expect(shownPicture()).toBe('Picture 3');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add a picture at the start' }),
    );
    await expect(status).toHaveTextContent('4 of 7');
    await expect(shownPicture()).toBe('Picture 3');
    await settled(carousel);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove the picture shown' }),
    );
    await expect(status).toHaveTextContent('4 of 6');
    await expect(shownPicture()).toBe('Picture 4');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add a picture at the start' }),
    );
    await expect(status).toHaveTextContent('5 of 7');
    await expect(shownPicture()).toBe('Picture 4');
    await settled(carousel);
  },
};

/**
 * At either end, Previous or Next cannot be pressed and says why, at once on focus and hover, and
 * stays focusable: the press that reaches the last slide keeps the focus on Next. The reason shows
 * the next time the button takes the focus or the pointer, as a button's reason does.
 */
export const Ends: Story = {
  args: { items: pictures(3) },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const page = within(document.body);
    const status = within(carouselNamed(canvasElement)).getByRole('status');
    const previous = canvas.getByRole('button', { name: 'Previous' });
    const next = canvas.getByRole('button', { name: 'Next' });

    pressTab(document);
    await expect(previous).toHaveFocus();
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'This is the first picture',
    );
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveTextContent('1 of 3');
    await expect(previous).toHaveFocus();

    pressTab(document);
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveTextContent('2 of 3');
    await expect(previous).not.toHaveAttribute('aria-disabled');
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveTextContent('3 of 3');
    await expect(next).toHaveFocus();
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(status).toHaveTextContent('3 of 3');
    await expect(next).toHaveFocus();

    pressTab(document, { isShift: true });
    await expect(previous).toHaveFocus();
    pressTab(document);
    await expect(next).toHaveFocus();
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'This is the last picture',
    );
  },
};

/**
 * A carousel whose set the page changes while the focus stays in the carousel: the page's buttons
 * here are pressed without taking the focus, as a change that arrives from elsewhere would.
 */
const ShrinkingCarousel = () => {
  const [items, setItems] = useState(() => pictures(12));
  const state = useCarouselState({ items });
  return (
    <div className='flex flex-col items-start gap-3'>
      <Carousel
        {...carouselText}
        state={state}
        aria-label='Pictures'
        shape={{ width: 4, height: 3 }}
        renderSlide={(picture) => (
          <div className='relative size-full'>
            <PictureSlide picture={picture} />
            <Button className='absolute end-2 bottom-2'>
              {`Open ${picture.title}`}
            </Button>
          </div>
        )}
        indicator={{
          scrubberLabel: 'Picture',
          renderThumbnail: (picture) => <PictureThumbnail picture={picture} />,
        }}
        className='w-full max-w-xl'
      />
      <div className='flex flex-wrap gap-2'>
        <Button onPress={() => setItems((list) => list.slice(0, 5))}>
          Keep five pictures
        </Button>
        <Button
          onPress={() =>
            setItems((list) =>
              list.filter((picture) => picture.id !== state.current?.id),
            )
          }
        >
          Remove the picture shown
        </Button>
        <Button onPress={() => setItems([])}>Remove every picture</Button>
        <Button onPress={() => setItems(pictures(12))}>
          Add twelve pictures
        </Button>
      </div>
    </div>
  );
};

/**
 * The control that holds the focus goes away as the set changes: the scrubber when the set shrinks
 * to nine or fewer, a button in the slide shown when its picture is removed, Next when every
 * picture is. The focus never falls to the page: the carousel itself takes it, and keeps it as the
 * set grows again.
 */
export const FocusStaysWhenTheSetChanges: Story = {
  render: () => <ShrinkingCarousel />,
  play: async ({ canvas, canvasElement }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    const press = (name: string) =>
      canvas.getByRole('button', { name }).click();

    const scrubber = within(carousel).getByRole('slider', { name: 'Picture' });
    scrubber.focus();
    await expect(scrubber).toHaveFocus();
    press('Keep five pictures');
    await waitFor(async () => {
      await expect(status).toHaveTextContent('1 of 5');
    });
    await expect(within(carousel).queryByRole('slider')).toBeNull();
    await expect(carousel).toHaveFocus();
    // The scrubber that held the focus is gone, so the status is announced again.
    await expect(status).toHaveAttribute('aria-live', 'polite');

    const open = within(carousel).getByRole('button', {
      name: 'Open Picture 1',
    });
    open.focus();
    await expect(open).toHaveFocus();
    press('Remove the picture shown');
    await waitFor(async () => {
      await expect(status).toHaveTextContent('1 of 4');
    });
    await expect(carousel).toHaveFocus();

    const next = within(carousel).getByRole('button', { name: 'Next' });
    next.focus();
    await expect(next).toHaveFocus();
    press('Remove every picture');
    await waitFor(async () => {
      await expect(status).toBeEmptyDOMElement();
    });
    await expect(next).toBeDisabled();
    await expect(carousel).toHaveFocus();

    // Back on the picture it was last on, which has come back.
    press('Add twelve pictures');
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 of 12');
    });
    await expect(
      within(carousel).getByRole('slider', { name: 'Picture' }),
    ).toBeInTheDocument();
    await expect(carousel).toHaveFocus();
  },
};

/** A carousel over a set read a page of four at a time, opened on the sixth picture. */
const PagedCarousel = () => {
  const [items, setItems] = useState(() => pictures(4));
  const state = useCarouselState({ items, defaultCurrentId: 'picture-6' });
  return (
    <div className='flex flex-col items-start gap-3'>
      <Carousel
        {...carouselText}
        state={state}
        aria-label='Pictures'
        shape={{ width: 4, height: 3 }}
        renderSlide={(picture) => <PictureSlide picture={picture} />}
        className='w-full max-w-xl'
      />
      <Button
        onPress={() =>
          setItems((list) => [...list, ...pictures(4, list.length + 1)])
        }
      >
        Read the next page
      </Button>
    </div>
  );
};

/**
 * Opened on a picture the set does not hold yet, as when the set is read a page at a time: the
 * carousel shows the first picture meanwhile, and goes to the one it was opened on when its page
 * arrives.
 */
export const OpensOnAPictureStillToCome: Story = {
  render: () => <PagedCarousel />,
  play: async ({ canvas, canvasElement }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    await expect(status).toHaveTextContent('1 of 4');

    canvas.getByRole('button', { name: 'Read the next page' }).click();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('6 of 8');
    });
    await expect(
      within(currentSlide(carousel)).getByRole('img'),
    ).toHaveAccessibleName('Picture 6');
  },
};

/**
 * The person leaves the carousel for the rest of the page, with a click there, and scrolls away
 * from it; then its set changes. The carousel does not take the focus back, and the page stays
 * where the person scrolled it.
 */
export const FocusLeftForThePage: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <ShrinkingCarousel />
      <p className='h-[200vh]'>The rest of the page.</p>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const window = document.defaultView;
    if (window === null) {
      throw new Error('The story has no window.');
    }
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');

    await userEvent.click(
      within(carousel).getByRole('button', { name: 'Next' }),
    );
    await expect(status).toHaveTextContent('2 of 12');
    await userEvent.click(canvas.getByText('The rest of the page.'));
    await expect(document.body).toHaveFocus();

    window.scrollTo(0, 600);
    const scrolled = window.scrollY;
    await expect(scrolled).toBeGreaterThan(0);
    canvas.getByRole('button', { name: 'Remove the picture shown' }).click();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 of 11');
    });
    await expect(document.body).toHaveFocus();
    await expect(window.scrollY).toBe(scrolled);
  },
};

/**
 * A set of one: Previous and Next are drawn, and each says why it cannot be pressed, so the frame
 * keeps its place if the set grows.
 */
export const SetOfOne: Story = {
  args: { items: pictures(1) },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      within(carouselNamed(canvasElement)).getByRole('status'),
    ).toHaveTextContent('1 of 1');
    await expect(
      canvas.getByRole('button', { name: 'Previous' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('button', { name: 'Next' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

/**
 * Two carousels on a page: the arrow keys turn the one that holds the focus, and neither while the
 * focus is outside both.
 */
export const KeyboardInline: Story = {
  render: () => (
    <div className='flex flex-col gap-6'>
      <PictureCarousel label='Kitchen' items={pictures(4)} />
      <PictureCarousel label='Garden' items={pictures(4, 5)} />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const kitchen = carouselNamed(canvasElement, 'Kitchen');
    const garden = carouselNamed(canvasElement, 'Garden');
    const kitchenStatus = within(kitchen).getByRole('status');
    const gardenStatus = within(garden).getByRole('status');

    // On the kitchen's Previous.
    pressTab(document);
    await expect(
      within(kitchen).getByRole('button', { name: 'Previous' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await expect(kitchenStatus).toHaveTextContent('3 of 4');
    await expect(gardenStatus).toHaveTextContent('1 of 4');

    // On the garden's Previous: the kitchen stays where it is.
    pressTab(document);
    pressTab(document);
    await expect(
      within(garden).getByRole('button', { name: 'Previous' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(gardenStatus).toHaveTextContent('2 of 4');
    await expect(kitchenStatus).toHaveTextContent('3 of 4');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(gardenStatus).toHaveTextContent('1 of 4');

    // With the focus outside both, the arrow keys turn neither.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await userEvent.keyboard('{ArrowRight}');
    await expect(kitchenStatus).toHaveTextContent('3 of 4');
    await expect(gardenStatus).toHaveTextContent('1 of 4');
  },
};

/**
 * Something in a slide holds the focus, here a button: the arrow keys turn the carousel from there
 * too, and since that slide goes out of view, the focus goes to the carousel itself rather than
 * falling to the page.
 */
export const FocusInASlide: Story = {
  args: { items: pictures(3), hasSlideButtons: true },
  play: async ({ canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');

    pressTab(document);
    pressTab(document);
    await expect(
      within(carousel).getByRole('button', { name: 'Open Picture 1' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('2 of 3');
    await expect(carousel).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('3 of 3');
    await expect(carousel).toHaveFocus();
  },
};

/**
 * Dragged sideways with the mouse (or swiped), a slide follows the pointer. Let go past 15% of the
 * width, the carousel turns; short of that, the slide springs back. At an end it gives a little
 * and springs back, and turns no further.
 */
export const Drag: Story = {
  args: { items: pictures(5) },
  play: async ({ canvasElement }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    const frame = frameOf(carousel);
    await settled(carousel);
    const width = frame.getBoundingClientRect().width;
    const offset = () =>
      currentSlide(carousel).getBoundingClientRect().left -
      frame.getBoundingClientRect().left;

    // A tenth of the width: the slide follows, then springs back.
    let release = await dragSideways(currentSlide(carousel), -width / 10);
    await expect(offset()).toBeLessThan(-width / 20);
    await release();
    await settled(carousel);
    await expect(status).toHaveTextContent('1 of 5');

    // Three tenths: it turns to the next slide.
    release = await dragSideways(currentSlide(carousel), (-width * 3) / 10);
    await release();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 of 5');
    });
    await settled(carousel);

    // Back the other way.
    release = await dragSideways(currentSlide(carousel), (width * 3) / 10);
    await release();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('1 of 5');
    });
    await settled(carousel);

    // Past the start: it gives a tenth of the drag, then springs back, on the first slide.
    release = await dragSideways(currentSlide(carousel), width / 2);
    await expect(offset()).toBeGreaterThan(0);
    await expect(offset()).toBeLessThanOrEqual(width / 20 + 1);
    await release();
    await settled(carousel);
    await expect(status).toHaveTextContent('1 of 5');
  },
};

/** Slides whose button opens their picture, and a line that says what was opened. */
const OpeningCarousel = () => {
  const [opened, setOpened] = useState('Nothing opened');
  return (
    <div className='flex flex-col gap-3'>
      <PictureCarousel
        items={pictures(3)}
        hasSlideButtons
        onOpen={(picture) => setOpened(`Opened ${picture.title}`)}
      />
      <p>{opened}</p>
    </div>
  );
};

/**
 * A drag that starts on something in a slide that takes presses, here a button that opens the
 * picture, moves the slides and does not press it, whether it turns the page or springs back; a
 * press without a drag still presses it.
 */
export const DragFromAControl: Story = {
  render: () => <OpeningCarousel />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    await settled(carousel);
    const width = frameOf(carousel).getBoundingClientRect().width;

    let release = await dragSideways(
      canvas.getByRole('button', { name: 'Open Picture 1' }),
      (-width * 3) / 10,
    );
    await release();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 of 3');
    });
    await afterRelease();
    await expect(
      canvas.getByText(/^(Nothing opened|Opened)/),
    ).toHaveTextContent('Nothing opened');
    await settled(carousel);

    release = await dragSideways(
      canvas.getByRole('button', { name: 'Open Picture 2' }),
      -width / 10,
    );
    await release();
    await settled(carousel);
    await afterRelease();
    await expect(status).toHaveTextContent('2 of 3');
    await expect(
      canvas.getByText(/^(Nothing opened|Opened)/),
    ).toHaveTextContent('Nothing opened');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open Picture 2' }),
    );
    await expect(
      canvas.getByText(/^(Nothing opened|Opened)/),
    ).toHaveTextContent('Opened Picture 2');
  },
};

/**
 * The same with a finger: a swipe that starts on the button that opens the picture moves the
 * slides and does not press it, though no click follows a swipe and React Aria would otherwise
 * finish the press itself, whether the swipe turns the page or springs back.
 */
export const SwipeFromAControl: Story = {
  render: () => <OpeningCarousel />,
  play: async ({ canvas, canvasElement }) => {
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    await settled(carousel);
    const width = frameOf(carousel).getBoundingClientRect().width;

    let release = await dragSideways(
      canvas.getByRole('button', { name: 'Open Picture 1' }),
      (-width * 3) / 10,
      { pointerType: 'touch' },
    );
    await release();
    await waitFor(async () => {
      await expect(status).toHaveTextContent('2 of 3');
    });
    await afterRelease();
    await expect(
      canvas.getByText(/^(Nothing opened|Opened)/),
    ).toHaveTextContent('Nothing opened');
    await settled(carousel);

    release = await dragSideways(
      canvas.getByRole('button', { name: 'Open Picture 2' }),
      -width / 10,
      { pointerType: 'touch' },
    );
    await release();
    await settled(carousel);
    await afterRelease();
    await expect(status).toHaveTextContent('2 of 3');
    await expect(
      canvas.getByText(/^(Nothing opened|Opened)/),
    ).toHaveTextContent('Nothing opened');
  },
};

/**
 * A set with a video does not turn by dragging, since a drag across its player is the player's;
 * the arrow keys stay with the player while it holds the focus. Previous, Next, and the arrow keys
 * elsewhere in the carousel turn it. The video here is a stand-in, the browser's player with
 * nothing to play.
 */
export const WithVideo: Story = {
  args: { allowsDragging: false, items: [video, ...pictures(3, 2)] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    await settled(carousel);
    const width = frameOf(carousel).getBoundingClientRect().width;

    const release = await dragSideways(currentSlide(carousel), -width / 2);
    await release();
    await settled(carousel);
    await expect(status).toHaveTextContent('1 of 4');

    const video = within(carousel).getByLabelText('Video');
    video.focus();
    await expect(video).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('1 of 4');

    pressTab(document);
    await expect(canvas.getByRole('button', { name: 'Next' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('2 of 4');
  },
};

/**
 * In a right-to-left layout, the slides run from the right: the next one stands to the left, the
 * left arrow goes on, and the chevrons point the other way.
 */
export const RightToLeft: Story = {
  args: { items: pictures(4) },
  render: (args) => (
    <I18nProvider locale='ar-EG'>
      <div dir='rtl'>
        <PictureCarousel {...args} />
      </div>
    </I18nProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const carousel = carouselNamed(canvasElement);
    const status = within(carousel).getByRole('status');
    await settled(carousel);
    const [, neighbor] = drawnSlides(carousel);
    await expect(neighbor?.getBoundingClientRect().right).toBeLessThanOrEqual(
      frameOf(carousel).getBoundingClientRect().left + 1,
    );

    pressTab(document);
    await userEvent.keyboard('{ArrowLeft}');
    await expect(status).toHaveTextContent('2 of 4');
    await userEvent.keyboard('{ArrowRight}');
    await expect(status).toHaveTextContent('1 of 4');
  },
};
