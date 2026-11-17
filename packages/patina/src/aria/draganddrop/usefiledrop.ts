import { type DragAndDropHooks, useDragAndDrop } from 'react-aria-components';

import {
  type DropFailureReason,
  readDroppedFiles,
} from '../../internal/droppedfiles.ts';

/**
 * A collection's file drop, from `useFileDrop`, given to a collection such as `GridList` as `fileDrop`.
 * The collection draws the frame of a list that takes files while the drop is enabled.
 */
export type FileDrop = Readonly<{
  hooks: DragAndDropHooks;
  isDisabled: boolean;
}>;

/**
 * Makes a collection a target for files dropped on it as a whole. Files reach `onFiles`; a drop that
 * gave none is reported through `onDropError`, as `DropZone` does. Disabled, the drop refuses files,
 * and the collection keeps the same hooks: React Aria's collection calls them as React hooks, so a
 * collection whose hooks come and go between renders breaks the rules of hooks and throws.
 */
export const useFileDrop = ({
  isDisabled = false,
  allowsMultiple = true,
  onFiles,
  onDropError,
}: Readonly<{
  isDisabled?: boolean;
  allowsMultiple?: boolean;
  onFiles: (files: File[]) => void;
  onDropError: (reason: DropFailureReason) => void;
}>): FileDrop => ({
  hooks: useDragAndDrop({
    isDisabled,
    getDropOperation: () => 'copy',
    onRootDrop: (event) => {
      void readDroppedFiles(event.items, allowsMultiple).then((read) => {
        if ('files' in read) {
          onFiles(read.files);
        } else {
          onDropError(read.failure);
        }
      });
    },
  }).dragAndDropHooks,
  isDisabled,
});
