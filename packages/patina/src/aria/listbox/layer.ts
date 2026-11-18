import { createContext } from 'react';

/**
 * The layer a list of options stands on, which decides the colors of its options and section
 * headings: `overlay` in a popover (a `Select`'s or a `ComboBox`'s list), `surface` on the page (a
 * standalone `ListBox`). The standalone `ListBox` provides `surface`; a list in a popover provides
 * nothing and takes the default.
 */
export const ListBoxLayerContext = createContext<'overlay' | 'surface'>(
  'overlay',
);
