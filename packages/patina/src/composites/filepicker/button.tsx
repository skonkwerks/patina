import { Button, type ButtonProps } from '../../aria/button/index.js';
import { FilePicker } from './component.js';

export type FilePickerButtonProps = {
  label: string;
  /** MIME types or extensions the picker offers; what is accepted is the receiver's check. */
  acceptedFileTypes?: readonly string[];
  allowsMultiple?: boolean;
  isDisabled?: boolean;
  /** Whether what the chosen files started is still running: the button shows it and cannot be pressed. */
  isPending?: boolean;
  size?: ButtonProps['size'];
  onFiles: (files: File[]) => void;
};

/** A button that opens the file picker and hands the chosen files over; choosing none does nothing. */
export const FilePickerButton = ({
  label,
  acceptedFileTypes,
  allowsMultiple = true,
  isDisabled = false,
  isPending = false,
  size,
  onFiles,
}: FilePickerButtonProps) => (
  <FilePicker
    allowsMultiple={allowsMultiple}
    onFiles={onFiles}
    acceptedFileTypes={acceptedFileTypes}
  >
    <Button size={size} isDisabled={isDisabled} isPending={isPending}>
      {label}
    </Button>
  </FilePicker>
);
