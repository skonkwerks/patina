import { createContext, use } from 'react';

/**
 * The words Patina's components show when the app gives none, grouped by the component that shows
 * them. Patina's own are English; an app in another language gives its own through `I18nProvider`,
 * and a component's own prop still wins for that use. A word that depends on a number is a
 * function of it, so the app words it as its language needs.
 */
export type Messages = {
  /** `Pagination`. */
  pagination: {
    /** The arrow to the page before: "Previous page". */
    previousLabel: string;
    /** The arrow to the page after: "Next page". */
    nextLabel: string;
    /** A page's button, named by its number: "Page 3". */
    pageLabel: (page: number) => string;
    /** Why the arrow to the page before cannot be pressed: "This is the first page". */
    firstPageReason: string;
    /** Why the arrow to the page after cannot be pressed: "This is the last page". */
    lastPageReason: string;
  };
};

/** The words an app gives in place of Patina's: any group, and in it any of its words. */
export type MessagesOverrides = {
  [Group in keyof Messages]?: Partial<Messages[Group]>;
};

/** Patina's own words, in English. */
export const englishMessages: Messages = {
  pagination: {
    previousLabel: 'Previous page',
    nextLabel: 'Next page',
    pageLabel: (page) => `Page ${page}`,
    firstPageReason: 'This is the first page',
    lastPageReason: 'This is the last page',
  },
};

/** The words in force where a component stands: Patina's English, with every override above it. */
export const MessagesContext = createContext<Messages>(englishMessages);

/** The words in force where the calling component stands. */
export const useMessages = (): Messages => use(MessagesContext);

/** One group's words: each one given, where it is given; the base's for the rest. */
const overrideGroup = <Group extends object>(
  base: Group,
  given: Partial<Group> | undefined,
): Group => {
  const result = { ...base };
  for (const key in given) {
    const word = given[key];
    // A word given as undefined, as a lookup gives for a key its bundle lacks, keeps the base's.
    if (word !== undefined) {
      result[key] = word;
    }
  }
  return result;
};

/** The words under a provider: the ones above it, with its own in their place. */
export const overrideMessages = (
  base: Messages,
  given: MessagesOverrides | undefined,
): Messages => ({
  pagination: overrideGroup(base.pagination, given?.pagination),
});
