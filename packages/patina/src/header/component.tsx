import type { ReactNode } from 'react';

import { Count } from '../count/index.js';
import { PAGE_HEADING_ATTRIBUTE } from './focus.js';
import { headerStyles } from './styles.js';

/** The heading element for each level. */
const HEADING_TAGS = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;

/** `page` for the page's own heading; `section` for a heading under it, one size smaller. */
export type HeaderVariant = 'page' | 'section';

/** The heading element: 1 for the page, 2 for a section, 3 and 4 for sections nested deeper. */
export type HeaderLevel = 1 | 2 | 3 | 4;

export type HeaderProps = {
  /** The look, as `HeaderVariant` says. `page` by default. */
  variant?: HeaderVariant;
  /** The heading element, which keeps the outline correct: by default 1 for `page` and 2 for `section`. */
  level?: HeaderLevel;
  /** The heading text. */
  title: string;
  /** A count after the title in muted text, formatted by the caller, such as `(3)`. Give it once the number is known. */
  count?: string;
  /** One short phrase under the title, on one line, cut at its end. Instructions belong in the page's help, not here. */
  description?: string;
  /** Artwork before the title and description, in a square as tall as both. */
  media?: ReactNode;
  /** The info control right beside the title, such as an `InfoButton` that opens the page's help. */
  info?: ReactNode;
  /** Badges after the info control, such as a state `Chip`. */
  badges?: ReactNode;
  /** The controls that act on the whole page or section, at the right; an overflow menu comes last. */
  actions?: ReactNode;
};

/**
 * The one header for pages and sections: the title with an optional count, the info control and
 * badges beside it, the actions at the right, and a description under the title. A page renders it
 * through `Page`; a section renders it directly with `variant='section'`, and a section inside a
 * section also passes `level={3}`. A page's heading takes the focus when the focus would otherwise
 * fall (`focusPageHeading`), without being a Tab stop.
 */
export const Header = ({
  variant = 'page',
  level = variant === 'page' ? 1 : 2,
  title,
  count,
  description,
  media,
  info,
  badges,
  actions,
}: HeaderProps) => {
  const Heading = HEADING_TAGS[level];
  const styles = headerStyles({ variant, hasMedia: media !== undefined });
  const isPageHeading = variant === 'page';
  return (
    <header className={styles.root()}>
      <div className={styles.row()}>
        <div className={styles.main()}>
          {media !== undefined && (
            <div className={styles.mediaFrame()}>
              <div className={styles.media()}>{media}</div>
            </div>
          )}
          <div className={styles.text()}>
            <div className={styles.titleRow()}>
              <Heading
                className={styles.title()}
                tabIndex={isPageHeading ? -1 : undefined}
                {...{ [PAGE_HEADING_ATTRIBUTE]: isPageHeading || undefined }}
              >
                {title}
                {count !== undefined && (
                  <Count text={count} className={styles.count()} />
                )}
              </Heading>
              {info !== undefined && (
                <span className={styles.info()}>{info}</span>
              )}
              {badges !== undefined && (
                <span className={styles.badges()}>{badges}</span>
              )}
            </div>
            {description !== undefined && (
              <p className={styles.description()}>{description}</p>
            )}
          </div>
        </div>
        {actions !== undefined && (
          <div className={styles.actions()}>{actions}</div>
        )}
      </div>
    </header>
  );
};
