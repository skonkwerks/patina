import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconArchive,
  IconCircleDashed,
  IconFilePlus,
  IconFolderPlus,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../../aria/button/index.js';
import {
  Dialog,
  DialogCancel,
  DialogModal,
  DialogTrigger,
} from '../../aria/dialog/index.js';
import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '../../aria/menu/index.js';
import { CommandPalette } from './index.js';

/** A command: its icon beside its name, which is also the text the search matches. */
const Command = ({
  id,
  icon,
  name,
}: {
  id: string;
  icon: ReactNode;
  name: string;
}) => (
  <MenuItem id={id} textValue={name}>
    {icon}
    {name}
  </MenuItem>
);

const ICON = 'h-4 w-4 shrink-0';

type PaletteProps = {
  /**
   * Whether Archive applies: something is chosen to archive (the default). While nothing is, the
   * command is left out of the palette, not disabled, as an action that cannot apply is.
   */
  canArchive?: boolean;
  /**
   * Whether a Commands control opens the palette (the default). Without one, only the shortcut
   * opens it, from state, and an unrelated Save stands on the page to hold the focus.
   */
  hasControl?: boolean;
};

/**
 * A Commands control, the palette it opens, and a status line that says which command ran. The
 * palette also opens with Command+K on Apple's systems and Control+K elsewhere.
 */
const Palette = ({ canArchive = true, hasControl = true }: PaletteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ran, setRan] = useState('No command run');
  const palette = (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title='Commands'
      closeLabel='Close'
      searchLabel='Search commands'
      emptyText='No matching commands'
      shortcutKey='k'
      onAction={(key) => setRan(`Ran ${String(key)}`)}
    >
      <Command
        id='new-file'
        name='New file'
        icon={<IconFilePlus aria-hidden className={ICON} />}
      />
      <Command
        id='new-folder'
        name='New folder'
        icon={<IconFolderPlus aria-hidden className={ICON} />}
      />
      <MenuSeparator />
      <Command
        id='assign-to-me'
        name='Assign to me'
        icon={<IconUser aria-hidden className={ICON} />}
      />
      <Command
        id='change-status'
        name='Change status'
        icon={<IconCircleDashed aria-hidden className={ICON} />}
      />
      <Command
        id='add-label'
        name='Add label'
        icon={<IconTag aria-hidden className={ICON} />}
      />
      {canArchive && (
        <Command
          id='archive'
          name='Archive'
          icon={<IconArchive aria-hidden className={ICON} />}
        />
      )}
    </CommandPalette>
  );
  return (
    <div className='flex flex-col items-start gap-2'>
      {hasControl ? (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
          <Button>Commands</Button>
          {palette}
        </DialogTrigger>
      ) : (
        <>
          <Button>Save</Button>
          {palette}
        </>
      )}
      <p className='text-canvas-foreground-muted text-sm'>
        Or press ⌘K (Ctrl+K on Windows and Linux).
      </p>
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {ran}
      </p>
    </div>
  );
};

const meta = {
  title: 'Composites/CommandPalette',
  component: Palette,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The search field the focus stays in, whose active option React Aria points at. */
const activeOption = (search: HTMLElement) => {
  const id = search.getAttribute('aria-activedescendant');
  return id === null ? null : search.ownerDocument.getElementById(id);
};

/**
 * Open it from the control, type to filter, and Enter runs the command the filter leaves first;
 * the palette closes with the focus back on the control. The arrow keys move through the commands
 * while the focus stays in the search field.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Commands' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await page.findByRole('dialog', { name: 'Commands' });
    const search = within(dialog).getByRole('searchbox', {
      name: 'Search commands',
    });
    await waitFor(async () => {
      await expect(search).toHaveFocus();
    });
    await expect(within(dialog).getAllByRole('menuitem')).toHaveLength(6);

    // Typing filters, ignoring case; the first command left is the active one.
    await userEvent.keyboard('FOLD');
    await waitFor(async () => {
      await expect(within(dialog).getAllByRole('menuitem')).toHaveLength(1);
    });
    const folder = within(dialog).getByRole('menuitem', { name: 'New folder' });
    await waitFor(async () => {
      await expect(activeOption(search)).toBe(folder);
    });
    await userEvent.keyboard('{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ran new-folder',
    );
    // React Aria gives the focus back in the frame after the palette has gone.
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });

    // With nothing typed, the arrow keys walk the commands from the first.
    await userEvent.keyboard('{Enter}');
    const again = await page.findByRole('dialog', { name: 'Commands' });
    const searchAgain = within(again).getByRole('searchbox');
    await waitFor(async () => {
      await expect(searchAgain).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    const assign = within(again).getByRole('menuitem', {
      name: 'Assign to me',
    });
    await expect(activeOption(searchAgain)).toBe(assign);
    // The active command is the keyboard's, so it carries the focus ring.
    await expect(assign).toHaveAttribute('data-focus-visible', 'true');
    await expect(searchAgain).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ran assign-to-me',
    );
  },
};

/**
 * A search that matches nothing says so. Escape clears the search first and closes the palette
 * once it is empty, with the focus back on the control and no command run.
 */
export const NoMatch: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Commands' });
    await userEvent.click(trigger);
    const dialog = await page.findByRole('dialog', { name: 'Commands' });
    const search = within(dialog).getByRole('searchbox');
    await waitFor(async () => {
      await expect(search).toHaveFocus();
    });

    await userEvent.keyboard('zebra');
    await expect(
      await within(dialog).findByText('No matching commands'),
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect(search).toHaveValue('');
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getAllByRole('menuitem')).toHaveLength(6);

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'No command run',
    );
  },
};

/** Whether this browser's command modifier is Command, as the palette decides it. */
const isApple = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * The shortcut opens the palette from anywhere on the page, with the platform's command modifier
 * only; Escape closes it and the focus returns to where it was.
 */
export const Shortcut: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const [modifier, otherModifier] = isApple()
      ? ['Meta', 'Control']
      : ['Control', 'Meta'];
    const trigger = canvas.getByRole('button', { name: 'Commands' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    // The other modifier does not open it.
    await userEvent.keyboard(`{${otherModifier}>}k{/${otherModifier}}`);
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
    const dialog = await page.findByRole('dialog', { name: 'Commands' });
    await waitFor(async () => {
      await expect(within(dialog).getByRole('searchbox')).toHaveFocus();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
};

/**
 * Opened from state by the shortcut alone, with no control: a command still closes the palette when
 * it runs, and the focus returns to where it was, here an unrelated Save.
 */
export const ShortcutOnly: Story = {
  args: { hasControl: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modifier = isApple() ? 'Meta' : 'Control';
    const save = canvas.getByRole('button', { name: 'Save' });
    await userEvent.tab();
    await expect(save).toHaveFocus();

    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
    const dialog = await page.findByRole('dialog', { name: 'Commands' });
    await waitFor(async () => {
      await expect(within(dialog).getByRole('searchbox')).toHaveFocus();
    });
    await userEvent.keyboard('label{Enter}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('status')).toHaveTextContent('Ran add-label');
    await waitFor(async () => {
      await expect(save).toHaveFocus();
    });
  },
};

/**
 * A modal never opens over another: while another dialog holds the focus, the shortcut does
 * nothing, and the dialog stays as it was.
 */
export const ShortcutInsideADialog: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-2'>
      <DialogTrigger>
        <Button>Rename</Button>
        <DialogModal>
          <Dialog title='Rename project' closeLabel='Close'>
            <div className='flex justify-end'>
              <DialogCancel>Cancel</DialogCancel>
            </div>
          </Dialog>
        </DialogModal>
      </DialogTrigger>
      <Palette />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modifier = isApple() ? 'Meta' : 'Control';
    await userEvent.click(canvas.getByRole('button', { name: 'Rename' }));
    const rename = await page.findByRole('dialog', { name: 'Rename project' });
    const document = canvasElement.ownerDocument;
    await waitFor(async () => {
      await expect(rename.contains(document.activeElement)).toBe(true);
    });
    const focused = document.activeElement;

    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
    await expect(
      page.queryByRole('dialog', { name: 'Commands' }),
    ).not.toBeInTheDocument();
    await expect(document.activeElement).toBe(focused);
  },
};

/**
 * A command that cannot apply now is left out, not drawn disabled: with nothing chosen to archive,
 * Archive is not among the commands, and a search for it finds nothing.
 */
export const InapplicableCommandLeftOut: Story = {
  args: { canArchive: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Commands' }));
    const dialog = await page.findByRole('dialog', { name: 'Commands' });
    await waitFor(async () => {
      await expect(within(dialog).getByRole('searchbox')).toHaveFocus();
    });
    await expect(within(dialog).getAllByRole('menuitem')).toHaveLength(5);
    await expect(
      within(dialog).queryByRole('menuitem', { name: 'Archive' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('arch');
    await expect(
      await within(dialog).findByText('No matching commands'),
    ).toBeVisible();
  },
};

/**
 * A key press the page already handled is left to it: an editor that binds the same key and calls
 * `preventDefault` keeps its own action, and the palette stays closed.
 */
export const ShortcutHandledByThePage: Story = {
  args: { hasControl: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modifier = isApple() ? 'Meta' : 'Control';
    const save = canvas.getByRole('button', { name: 'Save' });
    await userEvent.tab();
    await expect(save).toHaveFocus();

    // The page's own handler takes the key first, on its way to the document.
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'k') {
        event.preventDefault();
      }
    };
    canvasElement.addEventListener('keydown', handle);
    try {
      await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
      await expect(
        page.queryByRole('dialog', { name: 'Commands' }),
      ).not.toBeInTheDocument();
      await expect(save).toHaveFocus();
    } finally {
      canvasElement.removeEventListener('keydown', handle);
    }

    // Once the page leaves the key alone, the shortcut opens the palette.
    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
    await expect(
      await page.findByRole('dialog', { name: 'Commands' }),
    ).toBeVisible();
  },
};

/**
 * While a menu is open, the shortcut does nothing: the menu stays, and no modal opens over it. A
 * select's list is the same kind of overlay, a modal popover React Aria gives the dialog role.
 */
export const ShortcutOverAMenu: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-2'>
      <MenuTrigger>
        <Button>Sort</Button>
        <Menu aria-label='Sort by'>
          <MenuItem id='name'>Name</MenuItem>
          <MenuItem id='date'>Date</MenuItem>
        </Menu>
      </MenuTrigger>
      <Palette hasControl={false} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modifier = isApple() ? 'Meta' : 'Control';
    await userEvent.click(canvas.getByRole('button', { name: 'Sort' }));
    // React Aria names a trigger's menu by its trigger.
    const menu = await page.findByRole('menu');
    await waitFor(async () => {
      await expect(
        menu.contains(canvasElement.ownerDocument.activeElement),
      ).toBe(true);
    });

    await userEvent.keyboard(`{${modifier}>}k{/${modifier}}`);
    await expect(
      page.queryByRole('dialog', { name: 'Commands' }),
    ).not.toBeInTheDocument();
    await expect(menu).toBeInTheDocument();
  },
};
