import { IconSettings } from '@tabler/icons-react';

import { IconButton } from '../../aria/iconbutton/index.js';
import { useMessages } from '../../internal/messages.js';
import { useSidePanel } from '../sidepanel/index.js';
import PreferencesForm from './form.js';
import type { CollectionPreferencesValue } from './types.js';

export type CollectionPreferencesProps = {
  /** The preferences in force, held and stored by the app (controlled). */
  preferences: CollectionPreferencesValue;
  /**
   * The person saved new preferences: the app takes them in at once, into its state and browser
   * storage, as a device's preferences are kept. The panel closes as Save is pressed, so a store
   * that is a server write, with a pending Save and a failure to show, is not served.
   */
  onConfirm: (preferences: CollectionPreferencesValue) => void;
  /**
   * The page sizes the person chooses among, for a `preferences` with a `pageSize`, the size in
   * force among them: a size not among them leaves the page size with nothing chosen.
   */
  pageSizeOptions?: readonly number[];
  /**
   * The gear's name, which says whose preferences it opens where a page has more than one table:
   * "Invoice preferences". By default the words in force ("Preferences").
   */
  'aria-label'?: string;
  /** The side panel's title, naming what the preferences are of. By default the gear's name. */
  title?: string;
};

/**
 * A table's preferences, as Cloudscape's: a gear in the table's `preferences` slot that opens them
 * in the shell's side panel, beside the table, as `ux/editing-surfaces.md` places "a form of
 * several preferences". The panel holds a form of the preferences the app holds: the page size, a
 * radio group of the app's sizes; wrapped lines, striped rows and compact rows, each a checkbox.
 * Save gives the app the new preferences and closes the panel; Cancel, Escape and the panel's
 * close drop the changes, and the focus goes back to the gear; while nothing has changed, Save
 * says so. Its words are the words in force; the gear's name and the panel's title are also given
 * per use, for a page with more than one table, and the form's own words, the same for every
 * table, per use through an `I18nProvider` around it. It needs the app shell, whose side panel it
 * opens.
 */
export const CollectionPreferences = ({
  preferences,
  onConfirm,
  pageSizeOptions,
  'aria-label': ariaLabel,
  title,
}: CollectionPreferencesProps) => {
  const words = useMessages().collectionPreferences;
  const panel = useSidePanel<true>();
  const name = ariaLabel ?? words.triggerLabel;
  return (
    <>
      <IconButton
        aria-label={name}
        hasTooltip
        aria-expanded={panel.isShowing}
        aria-controls={panel.panelId}
        onPress={(event) =>
          panel.toggle(true, {
            title: title ?? name,
            trigger: event.target,
          })
        }
      >
        <IconSettings aria-hidden className='size-4' />
      </IconButton>
      {panel.render(
        <PreferencesForm
          preferences={preferences}
          pageSizeOptions={pageSizeOptions}
          onSave={(saved) => {
            onConfirm(saved);
            panel.close();
          }}
          onCancel={() => panel.close()}
        />,
      )}
    </>
  );
};
