/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.ts`).
 *
 * The WCAG contrast ratio of two computed colors, for stories that hold a color pair to a minimum,
 * such as a control's edge against the layer it stands on (3:1, non-text contrast). Both colors are
 * read from `getComputedStyle`, so the story checks what the browser draws: the theme's value
 * through the token the component uses.
 */

/** The sRGB channels of a computed `rgb()` or `rgba()` color, 0 to 255; opaque colors only. */
const channels = (color: string): [number, number, number] => {
  const match = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(color);
  if (match === null) {
    throw new Error(`Not a computed rgb() color: ${color}`);
  }
  const [, red, green, blue, alpha] = match;
  if (alpha !== undefined && Number(alpha) !== 1) {
    throw new Error(`A translucent color has no contrast of its own: ${color}`);
  }
  return [Number(red), Number(green), Number(blue)];
};

/** WCAG relative luminance. */
const luminance = (color: string) => {
  const [red, green, blue] = channels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
};

/** The contrast ratio of two opaque computed colors, from 1 to 21. */
export const contrastRatio = (first: string, second: string) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
};

/** The non-text contrast an interface component's edge needs against what it stands on. */
export const NON_TEXT_CONTRAST = 3;
