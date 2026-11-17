import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useId, useState } from 'react';
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger,
  type Key,
  Label,
  ListBox,
  ListBoxItem,
  type Selection,
} from 'react-aria-components';

import { Button } from '../../aria/button/index.ts';
import { Popover } from '../../aria/popover/index.ts';
import { SearchField } from '../../aria/searchfield/index.ts';
import { fieldStyles } from '../../internal/field.ts';
import {
  multiSelectListBoxStyles,
  multiSelectOptionStyles,
  multiSelectStyles,
  multiSelectTriggerStyles,
} from './styles.ts';

export type MultiSelectOption = { id: string; label: string };

export type MultiSelectProps = (
  | {
      /** The field's visible label, such as "Tags": it names the trigger and the list. */
      label: string;
      'aria-label'?: undefined;
    }
  | {
      label?: undefined;
      /** The field's name without a visible label, for a field in a toolbar. */
      'aria-label': string;
    }
) & {
  /** What the closed trigger shows: the caller's summary of the choice, or of an empty one. */
  summary: string;
  /** The accessible name of the search field inside. */
  searchLabel: string;
  /** What the list says when the search matches no option. */
  noMatchesLabel: string;
  /** The name of the button under the list that empties the choice. */
  clearLabel: string;
  /** Why Clear cannot be pressed while nothing is chosen, such as "Nothing is chosen". */
  clearDisabledReason: string;
  options: readonly MultiSelectOption[];
  /**
   * The chosen options' ids, as React Aria's `Selection`. The object `onSelectionChange` gives is
   * stored and passed back unchanged, so React Aria keeps its range anchor; arrays for actions or the
   * summary are derived from it separately. `onSelectionChange` never gives `'all'`: select all
   * gives an explicit set of every option's id, or, under a search, the earlier choice plus the
   * options shown, so an option the search hides is never chosen by it. A caller's `'all'` is read as
   * every option's id.
   */
  selectedKeys: Selection;
  onSelectionChange: (keys: Selection) => void;
  /** Whether the choice is locked, such as while a write that uses it is pending. */
  isDisabled?: boolean;
  className?: string;
};

/**
 * Choose any number of options from a list that can be searched: a button that says what is chosen,
 * opening a popover with a search field over a multiple-selection list, and Clear under the list,
 * which empties the choice with one press. Clear is always there, so pressing it never takes the
 * focus away: while nothing is chosen, it says why it cannot be pressed. The search only narrows
 * what the list shows; the choice is the caller's, unchanged.
 */
export const MultiSelect = ({
  label,
  summary,
  searchLabel,
  noMatchesLabel,
  clearLabel,
  clearDisabledReason,
  options,
  selectedKeys,
  onSelectionChange,
  isDisabled = false,
  className,
  'aria-label': ariaLabel,
}: MultiSelectProps) => {
  const [query, setQuery] = useState('');
  const labelId = useId();
  const nameId = useId();
  const summaryId = useId();
  const shown = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  // The list is always given an explicit set, never 'all': React Stately turns 'all' into the keys of
  // the collection it holds, which is only the options the search shows, so unchoosing one option
  // after select all would silently unchoose every hidden one. A select-all selection carries no
  // range anchor, so building these sets loses nothing React Aria keeps.
  const chosen: Set<Key> =
    selectedKeys === 'all'
      ? new Set<Key>(options.map((option) => option.id))
      : selectedKeys;
  const isEmpty = chosen.size === 0;
  const changeSelection = (keys: Selection) => {
    if (keys !== 'all') {
      onSelectionChange(keys);
      return;
    }
    // Select all chooses every option, or under a search only what the search shows, added to the
    // earlier choice: an option the search hides is never acted on.
    const added = shown.length < options.length ? shown : options;
    onSelectionChange(
      new Set<Key>([...chosen, ...added.map((option) => option.id)]),
    );
  };
  const name = label ?? ariaLabel;
  const styles = multiSelectStyles();
  const parts = fieldStyles({ isDisabled });
  return (
    <div className={parts.root({ className })}>
      {label !== undefined && (
        <Label id={labelId} className={parts.label()}>
          {label}
        </Label>
      )}
      <DialogTrigger>
        {/* The trigger's accessible name is the field's name, read first, then the visible summary. */}
        <AriaButton
          isDisabled={isDisabled}
          aria-labelledby={`${label === undefined ? nameId : labelId} ${summaryId}`}
          className={(renderProps) => multiSelectTriggerStyles(renderProps)}
        >
          {label === undefined && (
            <span id={nameId} hidden>
              {ariaLabel}
            </span>
          )}
          <span id={summaryId} className={styles.summary()}>
            {summary}
          </span>
          <IconChevronDown className={styles.chevron()} aria-hidden />
        </AriaButton>
        <Popover className={styles.popover()}>
          <AriaDialog aria-label={name} className={styles.dialog()}>
            <SearchField
              aria-label={searchLabel}
              value={query}
              onChange={setQuery}
              autoFocus
            />
            <ListBox
              aria-label={name}
              selectionMode='multiple'
              // Escape closes the popover, keeping the choice; by default the list would clear it first.
              escapeKeyBehavior='none'
              selectedKeys={chosen}
              onSelectionChange={changeSelection}
              renderEmptyState={() => (
                <p className={styles.noMatches()}>{noMatchesLabel}</p>
              )}
              items={shown}
              className={(renderProps) => multiSelectListBoxStyles(renderProps)}
            >
              {(option) => (
                <ListBoxItem
                  id={option.id}
                  textValue={option.label}
                  className={({ isFocused, isSelected }) =>
                    multiSelectOptionStyles({ isFocused, isSelected })
                  }
                >
                  {({ isSelected }) => (
                    <>
                      <span className={styles.checkFrame()}>
                        {isSelected && (
                          <IconCheck aria-hidden className={styles.check()} />
                        )}
                      </span>
                      <span className={styles.optionLabel()}>
                        {option.label}
                      </span>
                    </>
                  )}
                </ListBoxItem>
              )}
            </ListBox>
            <Button
              variant='ghost'
              size='sm'
              className={styles.clear()}
              disabledReason={isEmpty ? clearDisabledReason : undefined}
              // A deliberate reset is the one place a new selection is made here.
              onPress={() => onSelectionChange(new Set())}
            >
              {clearLabel}
            </Button>
          </AriaDialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
};
