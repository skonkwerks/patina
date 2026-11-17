import { type ClassValue, clsx } from 'clsx';
import { composeRenderProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

/** Joins class names and resolves Tailwind conflicts (the later class wins). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/**
 * Composes a React Aria `className` (a string or a render-props function) with the wrapper's own
 * Tailwind classes, so a caller's classes override the wrapper's where they conflict.
 */
export const composeTailwindRenderProps = <T>(
  className: string | ((values: T) => string) | undefined,
  tailwind: string,
): string | ((values: T) => string) =>
  composeRenderProps(className, (cls) => cn(tailwind, cls));
