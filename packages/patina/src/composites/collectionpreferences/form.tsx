import { useReducer } from 'react';

import { Button } from '../../aria/button/index.js';
import { Checkbox } from '../../aria/checkbox/index.js';
import { Form } from '../../aria/form/index.js';
import { Radio, RadioGroup } from '../../aria/radiogroup/index.js';
import { fieldsReducer } from '../../internal/fieldsreducer.js';
import { useMessages } from '../../internal/messages.js';
import {
  defaultStagedPreferences,
  isUnchanged,
  shownPreferences,
  type StagedPreferences,
} from './staged.js';
import type { CollectionPreferencesValue } from './types.js';

type PreferencesFormProps = Readonly<{
  /** The preferences stored now, which the form shows wherever the person hasn't changed one. */
  preferences: CollectionPreferencesValue;
  pageSizeOptions: readonly number[] | undefined;
  onSave: (preferences: CollectionPreferencesValue) => void;
  onCancel: () => void;
}>;

/**
 * A sidecar of `CollectionPreferences`, private to its family: the form in the side panel. It
 * mounts each time the panel shows it, with nothing staged, and holds the person's changes until
 * Save gives the app the preferences it shows; Cancel, Escape or the panel's close drop them, since
 * the form goes with the panel. A preference the person hasn't changed shows the stored one, so a
 * newer stored value replaces it, and one they changed keeps their value (`ux/forms.md`, "Save and
 * Cancel"). While what it shows is what is stored, Save says so and sends nothing. A section shows
 * for each preference the app holds, and page size where the app gives its sizes.
 */
const C = ({
  preferences,
  pageSizeOptions,
  onSave,
  onCancel,
}: PreferencesFormProps) => {
  const words = useMessages().collectionPreferences;
  const [staged, dispatch] = useReducer(
    fieldsReducer<StagedPreferences>,
    undefined,
    defaultStagedPreferences,
  );
  const shown = shownPreferences(
    preferences,
    staged,
    pageSizeOptions !== undefined,
  );
  const unchanged = isUnchanged(shown, preferences);
  return (
    <Form
      onSubmit={() => {
        if (!unchanged) {
          onSave(shown);
        }
      }}
      actions={
        <>
          <Button onPress={onCancel}>{words.cancelLabel}</Button>
          <Button
            type='submit'
            variant='solid'
            tone='primary'
            disabledReason={unchanged ? words.nothingChangedReason : undefined}
          >
            {words.saveLabel}
          </Button>
        </>
      }
    >
      {pageSizeOptions !== undefined && shown.pageSize !== undefined && (
        <RadioGroup
          label={words.pageSizeLabel}
          value={String(shown.pageSize)}
          onChange={(value) =>
            dispatch({
              type: 'SET',
              payload: { field: 'pageSize', value: Number(value) },
            })
          }
        >
          {pageSizeOptions.map((size) => (
            <Radio key={size} value={String(size)}>
              {words.pageSizeOptionLabel(size)}
            </Radio>
          ))}
        </RadioGroup>
      )}
      {shown.allowsWrapping !== undefined && (
        <Checkbox
          isSelected={shown.allowsWrapping}
          onChange={(value) =>
            dispatch({
              type: 'SET',
              payload: { field: 'allowsWrapping', value },
            })
          }
          description={words.wrappedLinesDescription}
        >
          {words.wrappedLinesLabel}
        </Checkbox>
      )}
      {shown.isStriped !== undefined && (
        <Checkbox
          isSelected={shown.isStriped}
          onChange={(value) =>
            dispatch({
              type: 'SET',
              payload: { field: 'isStriped', value },
            })
          }
          description={words.stripedRowsDescription}
        >
          {words.stripedRowsLabel}
        </Checkbox>
      )}
      {shown.isCompact !== undefined && (
        <Checkbox
          isSelected={shown.isCompact}
          onChange={(value) =>
            dispatch({
              type: 'SET',
              payload: { field: 'isCompact', value },
            })
          }
          description={words.compactRowsDescription}
        >
          {words.compactRowsLabel}
        </Checkbox>
      )}
    </Form>
  );
};

C.displayName = 'PreferencesForm';
export default C;
