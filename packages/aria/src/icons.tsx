/*
 * The icons the wrappers and patina-blocks draw, as inline SVG, so neither package needs an icon library.
 *
 * The drawings are copied from Tabler Icons (https://tabler.io/icons), outline style, under the MIT
 * license; see THIRDPARTY.md. The names match Tabler's React components, so a wrapper reads the
 * same as before. An app is free to use any icon library for its own icons.
 */
import type { SVGProps } from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

/** One 24×24 outline icon: stroked in the current text color, sized by its class. */
const icon = (paths: readonly string[]) => {
  const Icon = ({ className, ...rest }: IconProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      {...rest}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
  return Icon;
};

export const IconAlertCircle = icon([
  'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
  'M12 8v4',
  'M12 16h.01',
]);
export const IconAlertTriangle = icon([
  'M12 9v4',
  'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0',
  'M12 16h.01',
]);
export const IconCheck = icon(['M5 12l5 5l10 -10']);
export const IconChevronDown = icon(['M6 9l6 6l6 -6']);
export const IconChevronRight = icon(['M9 6l6 6l-6 6']);
export const IconChevronUp = icon(['M6 15l6 -6l6 6']);
export const IconDotsVertical = icon([
  'M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  'M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  'M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
]);
export const IconDownload = icon([
  'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2',
  'M7 11l5 5l5 -5',
  'M12 4l0 12',
]);
export const IconInfoCircle = icon([
  'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
  'M12 9h.01',
  'M11 12h1v4h1',
]);
export const IconSearch = icon([
  'M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0',
  'M21 21l-6 -6',
]);
export const IconX = icon(['M18 6l-12 12', 'M6 6l12 12']);
