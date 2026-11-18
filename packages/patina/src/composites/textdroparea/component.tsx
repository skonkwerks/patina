import { useState } from 'react';
import { isTextDropItem } from 'react-aria-components';

import { DropTarget } from '../../aria/droptarget/index.js';
import {
  TextAreaBase,
  type TextAreaFieldProps,
} from '../../aria/textarea/base.js';
import { fieldStyles } from '../../internal/field.js';

export type TextDropAreaProps = TextAreaFieldProps & {
  /** The one text type a drop is read as, such as `text/plain`. */
  dropType: string;
  /** Called with the dropped text. The caller decides how it is inserted and whether it is valid. */
  onTextDrop: (text: string) => void;
  /** Shown when the dropped text cannot be read. */
  dropErrorMessage: string;
  /** Shown when a drop holds more than one item or none of `dropType`; nothing is inserted. */
  dropRefusedMessage: string;
};

/**
 * A text area that also takes text dropped on it. Its input always stands in the same drop target,
 * which is disabled while the field cannot be edited, so the input is one element for its whole
 * life. A text area with no drop is a `TextArea`, which carries no drop target at all.
 */
export const TextDropArea = ({
  dropType,
  onTextDrop,
  dropErrorMessage,
  dropRefusedMessage,
  ...rest
}: TextDropAreaProps) => {
  const [dropError, setDropError] = useState<string | null>(null);
  return (
    <TextAreaBase
      {...rest}
      inputMessage={
        dropError && (
          <p role='alert' className={fieldStyles().error()}>
            {dropError}
          </p>
        )
      }
      renderInput={(input, canEdit) => (
        <DropTarget
          aria-label={rest.label}
          isDisabled={!canEdit}
          getDropOperation={(types) =>
            types.has(dropType) ? 'copy' : 'cancel'
          }
          onDrop={(event) => {
            setDropError(null);
            const item = event.items.length === 1 ? event.items[0] : undefined;
            if (!item || !isTextDropItem(item) || !item.types.has(dropType)) {
              setDropError(dropRefusedMessage);
              return;
            }
            void item
              .getText(dropType)
              .then((text) => {
                if (canEdit) {
                  onTextDrop(text);
                }
              })
              .catch(() => setDropError(dropErrorMessage));
          }}
        >
          {input}
        </DropTarget>
      )}
    />
  );
};
