/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.ts`).
 *
 * The placeholder pictures of the carousel's and the media viewer's stories, drawn here as inline
 * SVG: a gradient and the picture's number, in shapes that differ from the frame's, so the bars
 * show. Their colors are content, not theme colors. The words every carousel story gives are here
 * once. `slides.testing.tsx` draws them.
 */

/** A picture of a set: its id, its title, its colors, and its shape. */
export type Picture = Readonly<{
  id: string;
  title: string;
  colors: readonly [string, string];
  width: number;
  height: number;
  /** A stand-in for a video, which plays in the browser's own player. */
  isVideo?: boolean;
}>;

const palette: readonly (readonly [string, string])[] = [
  ['#fcd34d', '#f43f5e'],
  ['#7dd3fc', '#2563eb'],
  ['#6ee7b7', '#15803d'],
  ['#fef08a', '#f97316'],
  ['#818cf8', '#0f172a'],
  ['#d9f99d', '#10b981'],
  ['#f0abfc', '#7e22ce'],
  ['#a5f3fc', '#0d9488'],
];

/** Shapes that differ from one another, so a picture sits whole inside the frame with bars. */
const shapes: readonly (readonly [number, number])[] = [
  [4, 3],
  [3, 4],
  [1, 1],
  [16, 9],
];

/** `count` pictures, numbered from `from`, with ids that say their number ("picture-3"). */
export const pictures = (count: number, from = 1): Picture[] =>
  Array.from({ length: count }, (_, offset) => {
    const number = from + offset;
    const [width, height] = shapes[number % shapes.length] ?? [1, 1];
    return {
      id: `picture-${number}`,
      title: `Picture ${number}`,
      colors: palette[number % palette.length] ?? ['#000000', '#ffffff'],
      width,
      height,
    };
  });

/** A stand-in for a video: the browser's own player, with nothing to play. */
export const video: Picture = {
  id: 'video',
  title: 'Video',
  colors: ['#000000', '#000000'],
  width: 16,
  height: 9,
  isVideo: true,
};

/** A picture as an image source: its gradient, and its number in the middle. */
export const pictureSource = (picture: Picture) => {
  const [from, to] = picture.colors;
  const number = picture.title.replace(/\D/g, '');
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${picture.width * 100} ${picture.height * 100}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="sans-serif" font-size="${Math.min(picture.width, picture.height) * 40}" fill="#ffffff">${number}</text></svg>`,
  )}`;
};

/** The words every carousel in the stories gives. */
export const carouselText = {
  'aria-roledescription': 'carousel',
  slideRoleDescription: 'slide',
  positionText: (position: number, count: number) => `${position} of ${count}`,
  previousLabel: 'Previous',
  nextLabel: 'Next',
  previousDisabledReason: 'This is the first picture',
  nextDisabledReason: 'This is the last picture',
};
