import { useEffect, useId, useState } from 'react';

import {
  SearchField,
  type SearchFieldProps,
} from '../../aria/searchfield/index.js';
import { textFilterStyles } from './styles.js';

/** How long the typing pauses before the count is announced, as Cloudscape waits. */
const ANNOUNCE_AFTER_MS = 2000;

/** A count announced, and the search it was announced for. */
type Announcement = Readonly<{ text: string; value: string }>;

export type TextFilterProps = Pick<SearchFieldProps, 'placeholder'> & {
  /** What the box searches, as its visible label: "Find invoices". */
  label: string;
  /** The text searched for, held by the app (controlled), as Cloudscape's. */
  value: string;
  /** The text changed: typed, or cleared by the clear control or Escape. */
  onChange: (value: string) => void;
  /**
   * How many rows match, in the app's words ("3 matches"): shown after the box while it holds
   * text, as the box's description, and announced politely once the typing pauses.
   */
  countText?: string;
};

/**
 * The search box over a table's rows, as Cloudscape's text filter: Patina's `SearchField` under
 * its visible label, and the count of matches after it while it holds text. The count is the box's
 * description, and it is announced politely two seconds after the typing pauses, so a person typing
 * hears it once rather than after every key. As Cloudscape's, it offers no past entries of its
 * own. It stands in a table's `filter` slot, for a table that holds every row; `useCollection`
 * gives it its props.
 */
export const TextFilter = ({
  label,
  value,
  onChange,
  countText,
  placeholder,
}: TextFilterProps) => {
  const countId = useId();
  const styles = textFilterStyles();
  const shownCount =
    value !== '' && countText !== undefined ? countText : undefined;
  const [announcement, setAnnouncement] = useState<Announcement>();
  useEffect(() => {
    if (shownCount === undefined) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setAnnouncement({ text: shownCount, value });
    }, ANNOUNCE_AFTER_MS);
    return () => clearTimeout(timer);
    // The text as well as the count: a further search with the same count waits for its own pause.
  }, [value, shownCount]);
  // Only the announcement made for the search and count now shown stands in the live region: one
  // made for an earlier search goes the moment the text changes, so a new search never brings the
  // last one's count back, and the next is a new node, so the same count after a further search
  // ("3 matches", then "3 matches") is announced again.
  const current =
    announcement?.value === value && announcement.text === shownCount
      ? announcement
      : undefined;
  return (
    <div className={styles.root()}>
      <SearchField
        label={label}
        aria-describedby={shownCount === undefined ? undefined : countId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete='off'
        className={styles.field()}
      />
      {shownCount !== undefined && (
        <span id={countId} className={styles.count()}>
          {shownCount}
        </span>
      )}
      <span aria-live='polite' className='sr-only'>
        {current !== undefined && <span>{current.text}</span>}
      </span>
    </div>
  );
};
