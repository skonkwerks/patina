import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, waitFor, within } from 'storybook/test';

import { Menu, MenuItem } from '../../aria/menu/index.ts';
import { Switch } from '../../aria/switch/index.ts';
import { FilePicker } from '../filepicker/index.ts';
import { SplitButton, type SplitButtonProps } from './index.ts';

const counts = ['1', '3', '10'] as const;

type CountedRunProps = Omit<SplitButtonProps, 'menu' | 'menuLabel'> & {
  showsCount?: boolean;
};

/** What the story's status line says after a number of runs. */
const runsText = (runs: number) => {
  if (runs === 0) {
    return 'Not run yet';
  }
  return runs === 1 ? 'Ran once' : `Ran ${String(runs)} times`;
};

/**
 * A Run whose menu sets how many times a press runs it; the menu marks the chosen count. A status
 * line under it counts the runs, so a press that runs and one that does not can be told apart.
 */
const CountedRun = ({ showsCount = false, ...props }: CountedRunProps) => {
  const [count, setCount] = useState<Selection>(() => new Set(['1']));
  const [runs, setRuns] = useState(0);
  const chosen = count === 'all' ? '1' : String([...count][0] ?? '1');
  return (
    <div className='flex flex-col items-start gap-2'>
      <SplitButton
        onPress={() => setRuns((n) => n + 1)}
        {...props}
        menuLabel={`Run count: ${chosen}`}
        menuContent={showsCount ? `${chosen}×` : undefined}
        menu={
          <Menu
            aria-label='Run count'
            selectionMode='single'
            disallowEmptySelection
            selectedKeys={count}
            onSelectionChange={setCount}
          >
            {counts.map((n) => (
              <MenuItem key={n} id={n}>
                {n === '1' ? 'Run once' : `Run ${n} times`}
              </MenuItem>
            ))}
          </Menu>
        }
      />
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {runsText(runs)}
      </p>
    </div>
  );
};

const meta = {
  title: 'Composites/SplitButton',
  component: CountedRun,
  args: { children: 'Run' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CountedRun>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The action and its menu part, a chevron named for what the menu sets. The keyboard reaches Run,
 * then the menu part; the menu marks the chosen count, and choosing another closes it with the
 * focus back on the menu part.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const run = canvas.getByRole('button', { name: 'Run' });

    await userEvent.tab();
    await expect(run).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Ran once');

    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Run count: 1' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const menu = await page.findByRole('menu');
    await expect(
      within(menu).getByRole('menuitemradio', { name: 'Run once' }),
    ).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(
      within(menu).getByRole('menuitemradio', { name: 'Run 3 times' }),
    );
    await waitFor(async () => {
      await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    });
    await expect(
      canvas.getByRole('button', { name: 'Run count: 3' }),
    ).toHaveFocus();
  },
};

/** The menu part shows the value it sets; its name says that value in words. */
export const ShowsValue: Story = {
  args: { showsCount: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Run count: 1' }));
    const menu = await page.findByRole('menu');
    await userEvent.click(
      within(menu).getByRole('menuitemradio', { name: 'Run 10 times' }),
    );
    const menuPart = await canvas.findByRole('button', {
      name: 'Run count: 10',
    });
    await expect(menuPart).toHaveTextContent('10×');
  },
};

/** While the action is at work, the menu part is disabled with it and does not open. */
export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const menuPart = canvas.getByRole('button', { name: 'Run count: 1' });
    await expect(menuPart).toBeDisabled();
    await userEvent.click(menuPart);
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
  },
};

/**
 * The action waits for something and says why on focus; pressing it runs nothing. The menu part
 * stays open to a change.
 */
export const DisabledWithReason: Story = {
  args: { disabledReason: 'Choose an input before running.' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const run = canvas.getByRole('button', { name: 'Run' });

    await userEvent.tab();
    await expect(run).toHaveFocus();
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'Choose an input before running.',
    );
    await userEvent.keyboard('{Enter}');
    await userEvent.click(run);
    await expect(canvas.getByRole('status')).toHaveTextContent('Not run yet');

    await userEvent.click(canvas.getByRole('button', { name: 'Run count: 1' }));
    await expect(await page.findByRole('menu')).toBeVisible();
  },
};

/** The small size, for a toolbar. */
export const Small: Story = { args: { size: 'sm' } };

const UploadWithReason = () => {
  const [hasFolder, setHasFolder] = useState(true);
  const [chosen, setChosen] = useState('No files chosen yet');
  const reason = hasFolder ? undefined : 'Choose a folder before uploading.';
  return (
    <div className='flex flex-col items-start gap-3'>
      <Switch isSelected={hasFolder} onChange={setHasFolder}>
        A folder is chosen
      </Switch>
      <CountedRun
        disabledReason={reason}
        wrapAction={(action) => (
          <FilePicker
            isDisabled={reason !== undefined}
            onFiles={(files) => {
              setChosen(
                files.length === 1
                  ? 'One file chosen'
                  : `${String(files.length)} files chosen`,
              );
            }}
          >
            {action}
          </FilePicker>
        )}
      >
        Upload
      </CountedRun>
      <p role='status' className='text-canvas-foreground-muted text-sm'>
        {chosen}
      </p>
    </div>
  );
};

/**
 * The action carried out by a wrapper, a `FilePicker` that opens the file dialog. The action stays
 * wrapped while its reason comes and goes, so it keeps its focus: focus Upload, then toggle the
 * switch with the keyboard and come back. While it has a reason, the picker refuses the press.
 */
export const WrappedAction: Story = {
  render: () => <UploadWithReason />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('The file picker renders no file input.');
    }
    const upload = canvas.getByRole('button', { name: 'Upload' });
    const folderChosen = canvas.getByRole('switch', {
      name: 'A folder is chosen',
    });

    // Each press that reaches the picker is a click on its hidden input. The listener counts them
    // and cancels each one, so no system file dialog opens in the browser that runs the test.
    let pickerOpens = 0;
    const countPickerOpen = (event: Event) => {
      event.preventDefault();
      pickerOpens += 1;
    };
    input.addEventListener('click', countPickerOpen, { capture: true });
    try {
      // Without a reason, every press, by click and by Enter, opens the picker.
      await userEvent.click(upload);
      await expect(pickerOpens).toBe(1);
      await userEvent.keyboard('{Enter}');
      await expect(pickerOpens).toBe(2);

      // The switch, toggled with the keyboard, gives Upload its reason.
      await userEvent.tab({ shift: true });
      await expect(folderChosen).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect(folderChosen).not.toBeChecked();

      // Upload is the same element as before the reason came, so it was never remounted. It takes
      // the focus, says why it does nothing, and no press opens the picker.
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Upload' })).toBe(upload);
      await expect(upload).toHaveFocus();
      await expect(await page.findByRole('tooltip')).toHaveTextContent(
        'Choose a folder before uploading.',
      );
      await userEvent.keyboard('{Enter}');
      await userEvent.click(upload);
      await expect(pickerOpens).toBe(2);

      // The reason goes again: still the same Upload, and a press opens the picker once more.
      await userEvent.tab({ shift: true });
      await userEvent.keyboard(' ');
      await expect(canvas.getByRole('button', { name: 'Upload' })).toBe(upload);
      await userEvent.click(upload);
      await expect(pickerOpens).toBe(3);
    } finally {
      input.removeEventListener('click', countPickerOpen, { capture: true });
    }
  },
};
