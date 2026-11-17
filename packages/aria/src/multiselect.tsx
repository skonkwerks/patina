import { useState } from 'react';
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger,
  ListBox,
  ListBoxItem,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Button } from './button.tsx';
import { focusRing } from './focus.ts';
import { IconCheck, IconChevronDown } from './icons.tsx';
import { Popover } from './popover.tsx';
import { SearchField } from './searchfield.tsx';

export const multiSelectStyles = tv({
  slots: {
    triggerLabel: 'sr-only',
    summary: 'min-w-0 flex-1 truncate text-left',
    chevron: 'h-4 w-4 shrink-0',
    popover: 'w-72 p-2',
    dialog: 'flex flex-col gap-2 outline-0',
    noMatches: 'text-overlay-foreground-muted px-2 py-1.5 text-sm',
    listBox: 'max-h-64 overflow-auto outline-0',
    checkFrame: 'flex h-4 w-4 items-center justify-center',
    check: 'h-3.5 w-3.5',
    optionLabel: 'min-w-0 flex-1 truncate',
    clear: 'self-end',
  },
});

/** The trigger, which carries the shared focus ring. */
export const multiSelectTriggerStyles = tv({
  extend: focusRing,
  base: 'bg-input text-input-foreground border-input-border hover:bg-surface-hover inline-flex h-8 max-w-64 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm disabled:cursor-default disabled:opacity-50',
});

export const multiSelectOptionStyles = tv({
  base: 'flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-0 select-none',
  variants: {
    isFocused: { true: 'bg-overlay-hover' },
    isSelected: { true: 'font-medium' },
  },
});

export type MultiSelectOption = { id: string; label: string };

export type MultiSelectProps = {
  /** The name of the field, such as "Tags": the accessible name of the list and the start of the trigger's. */
  'aria-label': string;
  /** What the closed trigger shows: the caller's summary of the choice, or of an empty one. */
  summary: string;
  /** The placeholder of the search field inside. */
  searchLabel: string;
  /** What the list says when the search matches no option. */
  noMatchesLabel: string;
  /** The name of the button under the list that empties the choice, shown while something is chosen. */
  clearLabel: string;
  options: readonly MultiSelectOption[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  /** Whether the choice is locked, such as while a write that uses it is pending. */
  isDisabled?: boolean;
  className?: string;
};

/**
 * Choose any number of options from a list that can be searched: a button that says what is chosen,
 * opening a popover with a search field over a multiple-selection list, and under the list, while
 * something is chosen, Clear, which empties the choice with one press.
 */
export const MultiSelect = ({
  summary,
  searchLabel,
  noMatchesLabel,
  clearLabel,
  options,
  selected,
  onChange,
  isDisabled = false,
  className,
  ...rest
}: MultiSelectProps) => {
  const [query, setQuery] = useState('');
  const shown = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const styles = multiSelectStyles();
  return (
    <DialogTrigger>
      {/* The trigger's accessible name is the field name, read first, then the visible summary. */}
      <AriaButton
        isDisabled={isDisabled}
        className={(renderProps) =>
          multiSelectTriggerStyles({ ...renderProps, className })
        }
      >
        <span className={styles.triggerLabel()}>{rest['aria-label']}</span>
        <span className={styles.summary()}>{summary}</span>
        <IconChevronDown className={styles.chevron()} aria-hidden />
      </AriaButton>
      <Popover className={styles.popover()}>
        <AriaDialog aria-label={rest['aria-label']} className={styles.dialog()}>
          <SearchField
            aria-label={searchLabel}
            placeholder={searchLabel}
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <ListBox
            aria-label={rest['aria-label']}
            selectionMode='multiple'
            // Escape closes the popover, keeping the choice; by default the list would clear it first.
            escapeKeyBehavior='none'
            selectedKeys={new Set(selected)}
            onSelectionChange={(keys) => {
              // Select all covers only the options the search shows; hidden ones keep their state.
              onChange(
                keys === 'all'
                  ? [
                      ...new Set([
                        ...selected,
                        ...shown.map((option) => option.id),
                      ]),
                    ]
                  : [...keys].map(String),
              );
            }}
            renderEmptyState={() => (
              <p className={styles.noMatches()}>{noMatchesLabel}</p>
            )}
            items={shown}
            className={styles.listBox()}
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
                    <span className={styles.optionLabel()}>{option.label}</span>
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
          {selected.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className={styles.clear()}
              onPress={() => onChange([])}
            >
              {clearLabel}
            </Button>
          )}
        </AriaDialog>
      </Popover>
    </DialogTrigger>
  );
};
