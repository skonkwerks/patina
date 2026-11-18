import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.js';
import { Dialog, DialogModal, DialogTrigger } from '../../aria/dialog/index.js';
import { Header } from '../../header/index.js';
import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.js';
import { Alert } from '../alert/index.js';
import { AlertDialog, Confirmation } from './index.js';

/** How long the story's write runs before it answers. */
const WRITE_MS = 600;

type DeleteProjectProps = {
  /** The write fails, as when the server refuses it. */
  isRefused?: boolean;
  /**
   * The first write finds the project changed since the question opened (a conflict), and the
   * notice says so in a second paragraph: confirming again goes ahead with it as it is now.
   */
  isChangedSinceOpened?: boolean;
  /** The question opens on a request kept from before, whose answer was lost: a warning, no failure. */
  isKept?: boolean;
};

/**
 * A Delete control and its confirmation. Yes starts a write that answers after a moment, succeeds
 * or is refused, and a status line under the control says what happened.
 */
const DeleteProject = ({
  isRefused = false,
  isChangedSinceOpened = false,
  isKept = false,
}: DeleteProjectProps) => {
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<ReactNode>();
  const [hasConflicted, setHasConflicted] = useState(false);
  const [status, setStatus] = useState('Not deleted');
  const keptNotice = (
    <Alert tone='warning'>
      This deletion was requested before and its answer was lost. It is kept,
      and Yes sends it again unchanged.
    </Alert>
  );
  return (
    <div className='flex flex-col items-start gap-2'>
      <DialogTrigger
        onOpenChange={() => {
          setNotice(isKept ? keptNotice : undefined);
        }}
      >
        <Button tone='destructive'>Delete</Button>
        <AlertDialog
          title='Quarterly report'
          closeLabel='Close'
          cancelLabel='Cancel'
          actionLabel='Yes'
          tone='destructive'
          isPending={isPending}
          errorText={notice}
          onAction={(close) => {
            setIsPending(true);
            setNotice(undefined);
            setTimeout(() => {
              setIsPending(false);
              if (isRefused) {
                setNotice(
                  <Alert tone='error'>
                    The project could not be deleted: it is shared with another
                    team.
                  </Alert>,
                );
              } else if (isChangedSinceOpened && !hasConflicted) {
                setHasConflicted(true);
                setNotice(
                  <Alert tone='error'>
                    <p>The project could not be deleted: it changed.</p>
                    <p>
                      It changed since this confirmation opened. Confirm again
                      to go ahead with it as it is now.
                    </p>
                  </Alert>,
                );
              } else {
                setStatus('Deleted');
                close();
              }
            }, WRITE_MS);
          }}
        >
          Are you sure you want to delete this project?
        </AlertDialog>
      </DialogTrigger>
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {status}
      </p>
    </div>
  );
};

/**
 * Waits until React Aria's live announcer lets go of the pending Yes it announced, which is gone
 * once the dialog has closed (see `LIVE_ANNOUNCER_MESSAGE`).
 */
const announcerCleared = async (document: Document) =>
  waitFor(
    async () => {
      await expect(document.querySelector(LIVE_ANNOUNCER_MESSAGE)).toBeNull();
    },
    { timeout: LIVE_ANNOUNCER_CLEAR_MS },
  );

const meta = {
  title: 'Composites/AlertDialog',
  component: DeleteProject,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DeleteProject>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A destructive confirmation: named by the thing, described by its question, with the focus on
 * Cancel. Escape dismisses it; Yes runs the write, during which nothing dismisses the dialog, and
 * it closes on success with the focus back on Delete.
 */
export const Destructive: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Delete' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await page.findByRole('alertdialog', {
      name: 'Quarterly report',
    });
    await expect(dialog).toHaveAccessibleDescription(
      'Are you sure you want to delete this project?',
    );
    await waitFor(async () => {
      await expect(
        within(dialog).getByRole('button', { name: 'Cancel' }),
      ).toHaveFocus();
    });

    // Escape dismisses it, and the focus returns to Delete.
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    // React Aria gives the focus back in the frame after the dialog has gone.
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });

    // Yes, reached from Cancel with Tab, starts the write.
    await userEvent.keyboard('{Enter}');
    const again = await page.findByRole('alertdialog');
    const cancel = within(again).getByRole('button', { name: 'Cancel' });
    const yes = within(again).getByRole('button', { name: 'Yes' });
    await waitFor(async () => {
      await expect(cancel).toHaveFocus();
    });
    await userEvent.tab();
    await expect(yes).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    // While it runs, Cancel and the close control are disabled and Escape does nothing.
    await expect(cancel).toBeDisabled();
    await expect(
      within(again).getByRole('button', { name: 'Close' }),
    ).toBeDisabled();
    await expect(yes).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(again).toBeInTheDocument();

    // On success it closes, with the focus back on Delete.
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    // React Aria gives the focus back in the frame after the dialog has gone.
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Deleted');
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * A refused write: the failure shows above the buttons, the dialog stays open with the focus on
 * Yes, and Cancel works again.
 */
export const Refused: Story = {
  args: { isRefused: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Delete' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('alertdialog');
    const yes = within(dialog).getByRole('button', { name: 'Yes' });
    await userEvent.click(yes);

    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The project could not be deleted: it is shared with another team.',
    );
    await expect(dialog).toBeInTheDocument();
    await expect(yes).toHaveFocus();
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await expect(cancel).toBeEnabled();
    await userEvent.click(cancel);
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Not deleted');
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * A notice of more than one paragraph: after a conflict, the failure and what the next press does.
 * The app passes its own notice as `errorText`; confirming again goes ahead.
 */
export const ChangedSinceOpened: Story = {
  args: { isChangedSinceOpened: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    const dialog = await page.findByRole('alertdialog');
    const yes = within(dialog).getByRole('button', { name: 'Yes' });
    await userEvent.click(yes);

    const notice = await within(dialog).findByRole('alert');
    await expect(notice).toHaveTextContent(
      'The project could not be deleted: it changed.',
    );
    await expect(notice).toHaveTextContent(
      'Confirm again to go ahead with it as it is now.',
    );
    // Above the action row, so the row never moves under the pointer.
    await expect(
      notice.compareDocumentPosition(yes) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.click(yes);
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Deleted');
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * Not every notice is a failure: the question opens on a request kept from before, whose answer
 * was lost, with a warning that Yes sends it again unchanged.
 */
export const KeptRequest: Story = {
  args: { isKept: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    const dialog = await page.findByRole('alertdialog');
    await expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'It is kept, and Yes sends it again unchanged.',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Yes' }));
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/** An action with a consequence: the title names the action, the body states the consequence, and the focus starts on the action. */
const StartExport = () => {
  const [status, setStatus] = useState('Not exported');
  return (
    <div className='flex flex-col items-start gap-2'>
      <DialogTrigger>
        <Button variant='solid' tone='primary'>
          Export
        </Button>
        <AlertDialog
          title='Export the workspace'
          closeLabel='Close'
          cancelLabel='Cancel'
          actionLabel='Export'
          tone='primary'
          onAction={(close) => {
            setStatus('Exported');
            close();
          }}
        >
          The file holds every key of the workspace in clear text.
        </AlertDialog>
      </DialogTrigger>
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {status}
      </p>
    </div>
  );
};

export const WithConsequence: Story = {
  render: () => <StartExport />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Export' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const dialog = await page.findByRole('alertdialog', {
      name: 'Export the workspace',
    });
    const action = within(dialog).getByRole('button', { name: 'Export' });
    await waitFor(async () => {
      await expect(action).toHaveFocus();
    });
    await userEvent.keyboard('{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    // React Aria gives the focus back in the frame after the dialog has gone.
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Exported');
  },
};

type ProjectListProps = {
  /**
   * How long after the write the list is read again and the row leaves. Without it the row leaves
   * with the write's answer, in the same update that closes the dialog.
   */
  rereadMs?: number;
};

/**
 * A list of projects under the page's heading, each row with its own Delete and the confirmation
 * beside it. Yes deletes the row, and with it the Delete that opened the dialog, so the write
 * closes the dialog with `isOpenerRemoved`.
 */
const ProjectList = ({ rereadMs }: ProjectListProps) => {
  const [projects, setProjects] = useState(['Alpha', 'Beta', 'Gamma']);
  const [pending, setPending] = useState<string>();
  return (
    <div className='flex w-80 flex-col gap-3'>
      <Header title='Projects' />
      <ul className='flex flex-col gap-2'>
        {projects.map((project) => (
          <li key={project} className='flex items-center justify-between'>
            <span className='text-canvas-foreground text-sm'>{project}</span>
            <DialogTrigger>
              <Button
                size='sm'
                tone='destructive'
                aria-label={`Delete ${project}`}
              >
                Delete
              </Button>
              <AlertDialog
                title={project}
                closeLabel='Close'
                cancelLabel='Cancel'
                actionLabel='Yes'
                tone='destructive'
                isPending={pending === project}
                onAction={(close) => {
                  setPending(project);
                  setTimeout(() => {
                    setPending(undefined);
                    const removeRow = () =>
                      setProjects((all) => all.filter((p) => p !== project));
                    close({ isOpenerRemoved: true });
                    if (rereadMs === undefined) {
                      removeRow();
                    } else {
                      setTimeout(removeRow, rereadMs);
                    }
                  }, WRITE_MS);
                }}
              >
                Are you sure you want to delete this project?
              </AlertDialog>
            </DialogTrigger>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Waits two frames, past the frame in which React Aria would give the focus back to the opener. */
const nextFrames = (window: Window) =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });

/**
 * A confirmed write that removes its own opener: the row, its Delete and the confirmation leave
 * together, and the focus goes to the page's heading rather than falling to the document.
 */
export const RemovesItsOpener: Story = {
  render: () => <ProjectList />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const heading = canvas.getByRole('heading', { level: 1, name: 'Projects' });
    const remove = canvas.getByRole('button', { name: 'Delete Beta' });
    await userEvent.click(remove);
    const dialog = await page.findByRole('alertdialog', { name: 'Beta' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Yes' }));

    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    await expect(remove).not.toBeInTheDocument();
    await expect(canvas.queryByText('Beta')).not.toBeInTheDocument();
    await waitFor(async () => {
      await expect(heading).toHaveFocus();
    });
    await nextFrames(canvasElement.ownerDocument.defaultView ?? window);
    await expect(heading).toHaveFocus();
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * The ordinary path: the write's success closes the dialog with `isOpenerRemoved` at once, and the
 * row leaves a moment later, once the list is read again. The dialog leaves while its opener is
 * still there; the focus goes to the heading, not back to the Delete about to leave, and stays
 * there when the row goes.
 */
export const ClosesBeforeTheRowLeaves: Story = {
  render: () => <ProjectList rereadMs={400} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const heading = canvas.getByRole('heading', { level: 1, name: 'Projects' });
    const remove = canvas.getByRole('button', { name: 'Delete Beta' });
    await userEvent.click(remove);
    const dialog = await page.findByRole('alertdialog', { name: 'Beta' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Yes' }));

    // The dialog has gone and the row is still there.
    await waitFor(async () => {
      await expect(page.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    await expect(remove).toBeInTheDocument();
    await nextFrames(canvasElement.ownerDocument.defaultView ?? window);
    await expect(heading).toHaveFocus();

    // The list is read again and the row leaves; the focus stays on the heading.
    await waitFor(async () => {
      await expect(remove).not.toBeInTheDocument();
    });
    await expect(heading).toHaveFocus();
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * A dialog that goes on in the same modal after the person confirms: the `Confirmation` piece in
 * the caller's own dialog, then the new key where the question stood. The pending state is stated
 * once, on the `DialogModal`; the action reads it.
 */
const ReplaceKey = () => {
  const [isPending, setIsPending] = useState(false);
  const [newKey, setNewKey] = useState<string>();
  return (
    <DialogTrigger onOpenChange={() => setNewKey(undefined)}>
      <Button tone='destructive'>Replace key</Button>
      <DialogModal isDismissDisabled={isPending}>
        <Dialog title='Deploy key' closeLabel='Close'>
          {newKey === undefined ? (
            <Confirmation
              cancelLabel='Cancel'
              actionLabel='Yes'
              tone='destructive'
              onAction={() => {
                setIsPending(true);
                setTimeout(() => {
                  setIsPending(false);
                  setNewKey('dk_live_7Hq2Xa9');
                }, WRITE_MS);
              }}
            >
              Are you sure you want to replace this key?
            </Confirmation>
          ) : (
            <>
              <p className='text-overlay-foreground text-sm'>
                The new key: <code>{newKey}</code>
              </p>
              <div className='flex justify-end'>
                <Button variant='solid' tone='primary' slot='close'>
                  Done
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </DialogModal>
    </DialogTrigger>
  );
};

export const GoesOnAfterConfirming: Story = {
  render: () => <ReplaceKey />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Replace key' }));
    const dialog = await page.findByRole('dialog', { name: 'Deploy key' });
    const yes = within(dialog).getByRole('button', { name: 'Yes' });
    await userEvent.click(yes);

    // While the write runs, the action shows it from the modal's one fact, and Cancel is held.
    await expect(yes).toHaveAttribute('data-pending', 'true');
    await expect(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    ).toBeDisabled();

    // The dialog goes on with the new key where the question stood.
    await expect(
      await within(dialog).findByText('dk_live_7Hq2Xa9'),
    ).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await announcerCleared(canvasElement.ownerDocument);
  },
};
