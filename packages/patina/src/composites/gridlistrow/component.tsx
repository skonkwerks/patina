import { IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { GridListItem } from '../../aria/gridlist/index.js';
import { IconButton } from '../../aria/iconbutton/index.js';
import {
  InlineMetadata,
  type InlineMetadataItem,
} from '../../inlinemetadata/index.js';
import { gridListRowStyles } from './styles.js';

export type GridListRowProps = {
  /** The item's stable id in the list. */
  id: string;
  /** In a list whose rows can be dragged, the handle first in the row: an `IconButton` with `slot='drag'`. */
  dragHandle?: ReactNode;
  /** The unit's title: the row's first text, its typeahead text, and its accessible name. */
  title: string;
  /**
   * The picture or the mark of the unit, before its title: a `RowTile`, which is one size in every
   * list. A list in which one row has media has it in every row.
   */
  media?: ReactNode;
  /** After the title: the unit's badges (category and states) and markers. */
  badges?: ReactNode;
  /** The values on the line under the title, pipe-separated. */
  metadata?: readonly InlineMetadataItem[];
  /** A second line of values, about what the unit holds now, such as a slot's node. */
  secondaryMetadata?: readonly InlineMetadataItem[];
  /**
   * One muted line under the values, cut to one line: what the unit waits for, or what it is doing
   * now. Never why it is in its state: that reason goes behind a details control beside its badge
   * (or on its own page), so a row keeps its height.
   */
  description?: string;
  /** A value read at the right, before the actions, such as a price to compare. */
  endContent?: ReactNode;
  /**
   * For a row whose unit has a view of its own (its page): the row then ends with a chevron, after
   * its actions, which opens that view with one press. `label` names the chevron ("Open" and the unit's
   * name), and `onPress` does the opening. On the row itself a click selects, and a double click
   * or Enter opens, which is the list's `onAction`.
   */
  openAction?: { label: string; onPress: () => void };
  /** The row's controls at the right: buttons and icon actions first, the vertical-dots menu last. */
  actions?: ReactNode;
  /**
   * For a list in which only some rows have a menu, set on every row of it: a row that has no
   * actions then keeps the place the menu takes in the others, so that the end value ends at
   * the same place in every row.
   */
  hasActionSpace?: boolean;
  /** What shows under the row's lines, such as a failure's Alert. */
  children?: ReactNode;
};

/**
 * The one layout of a row in a `GridList`, so every list reads the same: an optional drag handle
 * and media, the title and its badges on the first line, the metadata lines and a description under
 * them, an end value, the chevron of a row that opens a view, and the actions centered at the
 * right, and anything else, such as a failure, below. The end values of a list are compared down its rows, so they end at one
 * place: a list in which only some rows have a menu says so on its rows (`hasActionSpace`), and
 * no caller pads a row itself. A row that needs a different layout is a reason to extend this
 * one, not to lay out a `GridListItem` by hand.
 */
export const GridListRow = ({
  id,
  dragHandle,
  title,
  media,
  badges,
  metadata,
  secondaryMetadata,
  description,
  endContent,
  openAction,
  actions,
  hasActionSpace = false,
  children,
}: GridListRowProps) => {
  const styles = gridListRowStyles({ hasActionSpace });
  return (
    <GridListItem id={id} textValue={title}>
      <div className={styles.root()}>
        <div className={styles.main()}>
          {dragHandle}
          {media}
          <div className={styles.text()}>
            <div className={styles.heading()}>
              <span className={styles.title()}>{title}</span>
              {badges}
            </div>
            {metadata && metadata.length > 0 && (
              <InlineMetadata items={metadata} />
            )}
            {secondaryMetadata && secondaryMetadata.length > 0 && (
              <InlineMetadata items={secondaryMetadata} />
            )}
            {description && (
              <p className={styles.description()}>{description}</p>
            )}
          </div>
          {endContent && (
            <span className={styles.endContent()}>{endContent}</span>
          )}
          {(openAction || actions || hasActionSpace) && (
            <div className={styles.actions()}>
              {actions}
              {openAction && (
                <IconButton
                  aria-label={openAction.label}
                  onPress={openAction.onPress}
                >
                  <IconChevronRight aria-hidden className={styles.openIcon()} />
                </IconButton>
              )}
            </div>
          )}
        </div>
        {children}
      </div>
    </GridListItem>
  );
};
