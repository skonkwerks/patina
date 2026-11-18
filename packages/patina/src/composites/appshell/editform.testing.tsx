import { useState } from 'react';

import { Button } from '../../aria/button/index.ts';
import {
  Dialog,
  DialogCancel,
  DialogModal,
  DialogTrigger,
} from '../../aria/dialog/index.ts';
import { SearchField } from '../../aria/searchfield/index.ts';
import { TextField } from '../../aria/textfield/index.ts';
import { useSidePanelHold } from '../sidepanel/index.ts';

/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.tsx`). The form the
 * shell demo shows in the side panel. Its writes are pretend: each takes a moment.
 */

export type Project = { id: string; name: string };

/** How long the pretend save and removal take. */
const WRITE_MS = 400;

/**
 * Edits one project in the side panel. It is held while a write is pending, and closed once the
 * write succeeds. Remove is confirmed first, in a centered modal over the panel (an application uses
 * its shared confirmation): the title names the project, the question repeats the verb, and Yes
 * removes it. The removal takes away the Edit that opened the form, so the form says so on closing.
 */
export const EditForm = ({
  project,
  onDone,
  onRemoved,
}: {
  project: Project;
  onDone: () => void;
  onRemoved: () => void;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  useSidePanelHold(isSaving || isRemoving);
  const save = () => {
    setIsSaving(true);
    window.setTimeout(onDone, WRITE_MS);
  };
  const remove = () => {
    setIsRemoving(true);
    window.setTimeout(onRemoved, WRITE_MS);
  };
  return (
    <div className='flex flex-col gap-4'>
      <TextField label='Name' defaultValue={project.name} />
      {/* A control that uses Escape itself: Escape clears its text before it closes the panel. */}
      <SearchField label='Find a member' />
      {/* The action row: Cancel, then the form's one action, last. */}
      <div className='flex justify-end gap-2'>
        <Button isDisabled={isSaving} onPress={onDone}>
          Cancel
        </Button>
        <Button
          variant='solid'
          tone='primary'
          isPending={isSaving}
          onPress={save}
        >
          Save
        </Button>
      </div>
      {/* A removal is not the form's action: it stands apart, below the row, in the plain style,
          and only its confirmation draws the destructive Yes. On a thing's own page it belongs to
          the page's Danger zone instead. */}
      <div className='border-surface-border border-t pt-4'>
        <DialogTrigger>
          <Button isDisabled={isSaving}>Remove</Button>
          <DialogModal isDismissDisabled={isRemoving}>
            <Dialog title={project.name} closeLabel='Close'>
              <p className='text-sm'>
                Are you sure you want to remove this project?
              </p>
              <div className='flex justify-end gap-2'>
                <DialogCancel>Cancel</DialogCancel>
                <Button
                  variant='solid'
                  tone='destructive'
                  isPending={isRemoving}
                  onPress={remove}
                >
                  Yes
                </Button>
              </div>
            </Dialog>
          </DialogModal>
        </DialogTrigger>
      </div>
      {/* A modal task opened from the panel's content: the modal drawer, over the panel. */}
      <DialogTrigger>
        <Button>Review changes</Button>
        <DialogModal placement='right'>
          <Dialog title='Review changes' closeLabel='Close'>
            <p className='text-sm'>The name changes from “{project.name}”.</p>
          </Dialog>
        </DialogModal>
      </DialogTrigger>
    </div>
  );
};
