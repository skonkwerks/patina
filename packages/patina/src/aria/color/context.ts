import { createContext } from 'react';

import type { ColorSwatchProps } from './swatch.js';

/** The size a `ColorSwatchPicker` gives every swatch in it, so all of its items match. */
export const SwatchSizeContext =
  createContext<ColorSwatchProps['size']>(undefined);
