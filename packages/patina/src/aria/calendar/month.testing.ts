// Helpers for the stories of the calendars and the date pickers, which read the months they show.

/** A day's button, by the date React Aria names it with ("Wednesday, November 18, 2026"). */
export const dayName = (date: string) => new RegExp(`\\b${date}\\b`);

/**
 * Previous or Next in the first month's header. React Aria also renders a visually hidden Next
 * after the months, for a screen reader's swipe, so the header's button is the first of that name.
 */
export const pageButton = (root: HTMLElement, name: 'Previous' | 'Next') => {
  const button = root.querySelector(`button[aria-label="${name}"]`);
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`The calendar shows no ${name} button.`);
  }
  return button;
};

/**
 * The names of the months shown: the heading of each month that holds a grid. React Aria's visually
 * hidden title, which repeats the calendar's name, stands outside the months.
 */
export const monthNames = (root: HTMLElement) =>
  [...root.querySelectorAll('div:has(> [role="grid"]) h2')].map(
    (heading) => heading.textContent,
  );

/** The focus ring an element draws now: its outline's width and offset, in pixels. */
export const ringOf = (element: Element) => {
  const style = getComputedStyle(element);
  return {
    width:
      style.outlineStyle === 'none' ? 0 : Number.parseFloat(style.outlineWidth),
    offset: Number.parseFloat(style.outlineOffset),
  };
};
