import { createContext } from 'react';

/** The layer a calendar stands on, which decides its text and hover colors. */
export type CalendarLayer = 'surface' | 'overlay';

/**
 * The layer a calendar stands on: a page's surface by default, or the overlay of the date pickers'
 * popover, which provides `overlay` around the calendar it opens. Not a public subpath.
 */
export const CalendarLayerContext = createContext<CalendarLayer>('surface');
