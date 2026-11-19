import { createContext, use } from 'react';

/**
 * The words Patina's components show when the app gives none, grouped by the component that shows
 * them. Patina's own are English; an app in another language gives its own through `I18nProvider`,
 * and a component's own prop still wins for that use. A word that depends on a number is a
 * function of it, so the app words it as its language needs.
 */
export type Messages = {
  /** `useCollection`, for the table, its `TextFilter` and its `Pagination`. */
  collection: {
    /** The no-match state's title, when a search matches no row: "No matches". */
    noMatchTitle: string;
    /** The no-match state's line: "Nothing matches the search." */
    noMatchDescription: string;
    /** The no-match state's button, which empties the search: "Clear search". */
    clearSearchLabel: string;
    /** How many rows a search matches, after the search box: "3 matches", "1,234 matches". */
    countText: (count: number) => string;
  };
  /** `CollectionPreferences`: its gear, and the form it opens in the side panel. */
  collectionPreferences: {
    /** The gear's name, and the side panel's title: "Preferences". */
    triggerLabel: string;
    /** The page size's group: "Page size". */
    pageSizeLabel: string;
    /** One page size, named by its number of rows: "1 row", "20 rows". */
    pageSizeOptionLabel: (size: number) => string;
    /** Wrapped lines, as what is so when checked: "Wrapped lines". */
    wrappedLinesLabel: string;
    wrappedLinesDescription: string;
    /** Striped rows, as what is so when checked: "Striped rows". */
    stripedRowsLabel: string;
    stripedRowsDescription: string;
    /** Compact rows, as what is so when checked: "Compact rows". */
    compactRowsLabel: string;
    compactRowsDescription: string;
    /** The form's actions: "Cancel" and "Save". */
    cancelLabel: string;
    saveLabel: string;
    /**
     * Why Save cannot be pressed while what the form shows is what is stored: "Nothing has
     * changed".
     */
    nothingChangedReason: string;
  };
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
  collection: {
    noMatchTitle: 'No matches',
    noMatchDescription: 'Nothing matches the search.',
    clearSearchLabel: 'Clear search',
    countText: (count) =>
      count === 1
        ? '1 match'
        : `${new Intl.NumberFormat('en-US').format(count)} matches`,
  },
  collectionPreferences: {
    triggerLabel: 'Preferences',
    pageSizeLabel: 'Page size',
    pageSizeOptionLabel: (size) =>
      size === 1
        ? '1 row'
        : `${new Intl.NumberFormat('en-US').format(size)} rows`,
    wrappedLinesLabel: 'Wrapped lines',
    wrappedLinesDescription:
      'Long text in the cells wraps onto more lines instead of being cut off.',
    stripedRowsLabel: 'Striped rows',
    stripedRowsDescription:
      'Every other row is shaded, so a row is easier to follow across.',
    compactRowsLabel: 'Compact rows',
    compactRowsDescription: 'Rows stand closer together, so more are in view.',
    cancelLabel: 'Cancel',
    saveLabel: 'Save',
    nothingChangedReason: 'Nothing has changed',
  },
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
  collection: overrideGroup(base.collection, given?.collection),
  collectionPreferences: overrideGroup(
    base.collectionPreferences,
    given?.collectionPreferences,
  ),
  pagination: overrideGroup(base.pagination, given?.pagination),
});
