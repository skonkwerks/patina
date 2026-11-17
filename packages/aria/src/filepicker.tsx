import type { ReactNode } from 'react';

import { FileTrigger } from './filetrigger.tsx';

export type FilePickerProps = {
  /** MIME types or extensions the picker offers; what is accepted is the receiver's check. */
  acceptedFileTypes?: readonly string[];
  allowsMultiple?: boolean;
  onFiles: (files: File[]) => void;
  children: ReactNode;
};

/**
 * Opens the file picker when its one pressable child is pressed, and hands the chosen files over;
 * choosing none does nothing. The child is any shared button, such as a split button's main action.
 */
export const FilePicker = ({
  acceptedFileTypes,
  allowsMultiple = true,
  onFiles,
  children,
}: FilePickerProps) => (
  <FileTrigger
    acceptedFileTypes={acceptedFileTypes ? [...acceptedFileTypes] : undefined}
    allowsMultiple={allowsMultiple}
    onSelect={(list) => {
      const files = list ? [...list] : [];
      if (files.length > 0) {
        onFiles(files);
      }
    }}
  >
    {children}
  </FileTrigger>
);
