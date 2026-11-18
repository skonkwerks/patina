import type { ReactNode } from 'react';

import { FileTrigger } from '../../aria/filetrigger/index.js';

export type FilePickerProps = {
  /** MIME types or extensions the picker offers; what is accepted is the receiver's check. */
  acceptedFileTypes?: readonly string[];
  allowsMultiple?: boolean;
  onFiles: (files: File[]) => void;
  /**
   * The picker does not open, while its child stays in place. For a child disabled by a reason
   * (`disabledReason`), which stays focusable and pressable for its tooltip: the picker's own press
   * handler would still open it, so the picker refuses it here instead of the caller unwrapping the
   * child, which would remount the child and drop its focus.
   */
  isDisabled?: boolean;
  children: ReactNode;
};

/**
 * Opens the file picker when its one pressable child is pressed, and hands the chosen files over;
 * choosing none does nothing. The child is any shared button, such as a split button's main action.
 * While `isDisabled`, a press opens nothing, and the child stays where it is.
 */
export const FilePicker = ({
  acceptedFileTypes,
  allowsMultiple = true,
  onFiles,
  isDisabled = false,
  children,
}: FilePickerProps) => (
  <FileTrigger
    // React Aria's FileTrigger opens its hidden file input on any press of its child, and gives no
    // way to disable it. A disabled input ignores the click, so the picker refuses the press there
    // and the tree around the child never changes. This relies on FileTrigger's implementation, not
    // its documented API: that its ref reaches the hidden input, and that a press opens the picker
    // through input.click() and nothing else does (react-aria-components 1.22.1). Check it again on
    // every React Aria upgrade; the SplitButton WrappedAction story is the check.
    ref={(input) => {
      if (input) {
        input.disabled = isDisabled;
      }
    }}
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
