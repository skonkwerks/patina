import {
  FileTrigger as AriaFileTrigger,
  type FileTriggerProps as AriaFileTriggerProps,
} from 'react-aria-components';

export type FileTriggerProps = AriaFileTriggerProps;

/** File picking without prescribing the trigger's appearance. */
export const FileTrigger = (props: FileTriggerProps) => (
  <AriaFileTrigger {...props} />
);
