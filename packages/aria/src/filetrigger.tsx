import {
  FileTrigger as AriaFileTrigger,
  type FileTriggerProps,
} from 'react-aria-components';

/** File picking without prescribing the trigger's appearance. */
export const FileTrigger = (props: FileTriggerProps) => (
  <AriaFileTrigger {...props} />
);
