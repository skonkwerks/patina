import { IconDownload } from '@tabler/icons-react';
import { DropZone as AriaDropZone, Text } from 'react-aria-components';

import {
  type DropFailureReason,
  readDroppedFiles,
} from '../../internal/droppedfiles.ts';
import { FilePickerButton } from '../filepicker/index.ts';
import { dropZoneStyles } from './styles.ts';

export type DropZoneProps = {
  /** The short statement in the zone: "Drop files here". */
  title: string;
  /** The line under it, before the button: "or choose them". */
  description?: string;
  /** The label of the file picker button. */
  chooseLabel: string;
  /** MIME types or extensions the picker offers; a drop is not limited by it. */
  acceptedFileTypes?: readonly string[];
  allowsMultiple?: boolean;
  isDisabled?: boolean;
  onFiles: (files: File[]) => void;
  /**
   * A drop that gave no files: `no-files` when it held none (text, a link), `too-many` when it held
   * several files and the zone takes one, `read-failed` when the files could not be read. The caller
   * shows the failure beside the zone.
   */
  onDropError: (reason: DropFailureReason) => void;
  className?: string;
};

/**
 * A target for dropped files with a file picker inside it, so the same handler receives files from
 * either. Drops are files only: a drop without files, one with several files where the zone takes
 * one, or one whose files cannot be read, is reported through `onDropError`, never ignored.
 */
export const DropZone = ({
  title,
  description,
  chooseLabel,
  acceptedFileTypes,
  allowsMultiple = true,
  isDisabled = false,
  onFiles,
  onDropError,
  className,
}: DropZoneProps) => {
  const styles = dropZoneStyles({ isDisabled });
  return (
    <AriaDropZone
      isDisabled={isDisabled}
      getDropOperation={() => 'copy'}
      onDrop={(event) => {
        void readDroppedFiles(event.items, allowsMultiple).then((read) => {
          if ('files' in read) {
            onFiles(read.files);
          } else {
            onDropError(read.failure);
          }
        });
      }}
      className={({ isDropTarget }) =>
        dropZoneStyles({ isDropTarget, isDisabled }).root({ className })
      }
    >
      <IconDownload aria-hidden className={styles.icon()} />
      <Text slot='label' className={styles.title()}>
        {title}
      </Text>
      {description && <p className={styles.description()}>{description}</p>}
      <FilePickerButton
        label={chooseLabel}
        size='sm'
        isDisabled={isDisabled}
        allowsMultiple={allowsMultiple}
        onFiles={onFiles}
        acceptedFileTypes={acceptedFileTypes}
      />
    </AriaDropZone>
  );
};
