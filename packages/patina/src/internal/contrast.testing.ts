/*
 * For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).
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

/**
 * The opaque color the browser paints for computed colors stacked bottom first, such as a selected
 * row's translucent tint over the surface under it: a canvas paints them, so any color syntax the
 * browser computes (`oklab()` from Tailwind's opacity modifier included) is composited as drawn.
 */
export const paintedColor = (...layers: string[]) => {
  const context = document.createElement('canvas').getContext('2d');
  if (context === null) {
    throw new Error('No 2D canvas to paint the colors on.');
  }
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${String(red)}, ${String(green)}, ${String(blue)})`;
};

/**
 * The surface an element stands on: the background of the nearest of it and its ancestors that
 * paints one, so a story reads what is drawn behind a part that has no fill of its own, such as a
 * table inside its frame.
 */
export const surfaceBehind = (element: Element) => {
  for (
    let node: Element | null = element;
    node !== null;
    node = node.parentElement
  ) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      return color;
    }
  }
  throw new Error('Nothing behind the element paints a background.');
};

/** The non-text contrast an interface component's edge needs against what it stands on. */
export const NON_TEXT_CONTRAST = 3;

/** A computed color in one shadow layer, such as `rgb(1, 2, 3)` or `rgba(0, 0, 0, 0)`. */
const SHADOW_COLOR = /rgba?\([^)]*\)/;

/**
 * The color of a ring drawn as a box shadow (Tailwind's `ring` and `inset-ring`): the one shadow
 * layer with a spread and a color that is not transparent. Tailwind keeps its other layers, empty,
 * in the same shadow.
 */
const ringColor = (boxShadow: string) => {
  // Layers are separated by commas outside parentheses: "rgb(1, 2, 3) 0px 0px 0px 1px inset, …".
  for (const layer of boxShadow.split(/,(?![^(]*\))/)) {
    const color = SHADOW_COLOR.exec(layer)?.[0];
    const lengths = layer.replace(SHADOW_COLOR, '').match(/-?[\d.]+px/g) ?? [];
    const spread = Number.parseFloat(lengths[3] ?? '0');
    if (color !== undefined && spread !== 0 && !color.endsWith(', 0)')) {
      return color;
    }
  }
  throw new Error(`No ring in the box shadow: ${boxShadow}`);
};

/**
 * The color a control's edge is drawn in, as the browser draws it, read by the utility that draws
 * it: a fill (`bg-control-border`, a slider's rail), a ring (`ring-control-border` or
 * `inset-ring-control-border`, a color swatch's or a color track's edge), or a border (the rest).
 */
export const edgeColor = (edge: HTMLElement) => {
  const style = getComputedStyle(edge);
  if (edge.className.includes('bg-control-border')) {
    return style.backgroundColor;
  }
  if (edge.className.includes('ring-control-border')) {
    return ringColor(style.boxShadow);
  }
  return style.borderTopColor;
};
