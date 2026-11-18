import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import {
  LIVE_ANNOUNCER_CLEAR_MS,
  LIVE_ANNOUNCER_MESSAGE,
} from '../../internal/liveannouncer.testing.js';
import { Shell } from './demo.testing.js';

/**
 * Waits until React Aria's live announcer has let go of a message labelled by an element this story
 * removed (a pending Save, a closed dialog's title), so the axe check and the next story meet no
 * label to a removed node (see `LIVE_ANNOUNCER_MESSAGE`).
 */
const announcerCleared = (document: Document) =>
  waitFor(
    async () => {
      await expect(document.querySelector(LIVE_ANNOUNCER_MESSAGE)).toBeNull();
    },
    { timeout: LIVE_ANNOUNCER_CLEAR_MS },
  );

const meta = {
  title: 'Composites/AppShell',
  component: Shell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Shell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The shell: the sidebar, the page, and the side panel, which an Edit or the help control opens. */
export const Default: Story = {};

/** Opening moves the focus to the panel's close control; Escape closes it and returns the focus. */
export const OpensAndCloses: Story = {
  play: async ({ canvas, userEvent }) => {
    const edit = canvas.getByRole('button', { name: 'Edit Alpha' });
    await userEvent.click(edit);
    const panel = await canvas.findByRole('complementary', {
      name: 'Edit Alpha',
    });
    const close = within(panel).getByRole('button', { name: 'Close' });
    await waitFor(() => expect(close).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(edit).toHaveFocus());
  },
};

/** One panel at a time: the help control and another Edit replace what it shows. */
export const SwapsContent: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Alpha' }));
    await canvas.findByRole('complementary', { name: 'Edit Alpha' });
    const help = canvas.getByRole('button', { name: 'Help with projects' });
    await userEvent.click(help);
    await canvas.findByRole('complementary', { name: 'Help' });
    await expect(canvas.getAllByRole('complementary')).toHaveLength(1);
    await expect(help).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Beta' }));
    await canvas.findByRole('complementary', { name: 'Edit Beta' });
    await expect(help).toHaveAttribute('aria-expanded', 'false');
  },
};

/** While a save is pending nothing closes or replaces the panel; the save's success closes it. */
export const HoldsWhilePending: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const edit = canvas.getByRole('button', { name: 'Edit Alpha' });
    await userEvent.click(edit);
    const panel = await canvas.findByRole('complementary', {
      name: 'Edit Alpha',
    });
    await userEvent.click(within(panel).getByRole('button', { name: 'Save' }));
    // Escape in the panel, and another Edit, change nothing while the save is pending.
    await userEvent.keyboard('{Escape}');
    const editBeta = canvas.getByRole('button', { name: 'Edit Beta' });
    await userEvent.click(editBeta);
    await expect(
      canvas.getByRole('complementary', { name: 'Edit Alpha' }),
    ).toBeInTheDocument();
    await expect(
      within(panel).getByRole('button', { name: 'Close' }),
    ).toBeDisabled();
    // The save's success closes the panel. The person moved to Edit Beta meanwhile, so the focus
    // stays where they are.
    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await expect(editBeta).toHaveFocus();
    await expect(edit).not.toHaveFocus();
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/** A panel showing a project that leaves the list closes, and the person keeps their place. */
export const ClosesWhenGone: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Beta' }));
    await canvas.findByRole('complementary', { name: 'Edit Beta' });
    const listed = canvas.getByRole('switch', { name: 'Beta is listed' });
    await userEvent.click(listed);
    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await expect(listed).toHaveFocus();
  },
};

/**
 * A modal sheet opened from the panel's content stands over the open panel: Escape closes the
 * modal alone, and the focus returns into the panel.
 */
export const ModalOverPanel: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Alpha' }));
    const panel = await canvas.findByRole('complementary', {
      name: 'Edit Alpha',
    });
    const review = within(panel).getByRole('button', {
      name: 'Review changes',
    });
    await userEvent.click(review);
    await expect(
      await page.findByRole('dialog', { name: 'Review changes' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('complementary', { name: 'Edit Alpha' }),
    ).toBeInTheDocument();
    // React Aria restores the focus to the modal's opener as the modal leaves.
    await waitFor(() => expect(review).toHaveFocus());
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * Escape goes first to the control the person is in: in a search field holding text it clears the
 * text and the panel stays; the next Escape closes the panel.
 */
export const EscapeInField: Story = {
  play: async ({ canvas, userEvent }) => {
    const edit = canvas.getByRole('button', { name: 'Edit Alpha' });
    await userEvent.click(edit);
    const panel = await canvas.findByRole('complementary', {
      name: 'Edit Alpha',
    });
    const search = within(panel).getByRole('searchbox', {
      name: 'Find a member',
    });
    await userEvent.click(search);
    await userEvent.keyboard('ann');
    await userEvent.keyboard('{Escape}');
    await expect(search).toHaveValue('');
    await expect(
      canvas.getByRole('complementary', { name: 'Edit Alpha' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(edit).toHaveFocus());
  },
};

type PlayContext = Parameters<NonNullable<Story['play']>>[0];

/**
 * From the keyboard: into the list, to Beta's row and right to its Edit (as a keyboard reaches a
 * row's action), Enter; Tab to the panel's Remove, Enter; Tab to the confirmation's Yes, Enter.
 * Ends once the panel has closed.
 */
const removeBetaFromKeyboard = async ({
  canvas,
  canvasElement,
  userEvent,
}: PlayContext) => {
  const tabTo = async (control: HTMLElement) => {
    for (let step = 0; step < 8 && !control.matches(':focus'); step += 1) {
      await userEvent.tab();
    }
    await expect(control).toHaveFocus();
  };
  canvas.getByRole('switch', { name: 'Beta is listed' }).focus();
  await userEvent.tab();
  await userEvent.keyboard('{ArrowDown}{ArrowRight}');
  await expect(canvas.getByRole('button', { name: 'Edit Beta' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  const panel = await canvas.findByRole('complementary', { name: 'Edit Beta' });
  await waitFor(() =>
    expect(within(panel).getByRole('button', { name: 'Close' })).toHaveFocus(),
  );
  await tabTo(within(panel).getByRole('button', { name: 'Remove' }));
  await userEvent.keyboard('{Enter}');
  const confirmation = await within(
    canvasElement.ownerDocument.body,
  ).findByRole('dialog', { name: 'Beta' });
  await expect(confirmation).toHaveTextContent(
    'Are you sure you want to remove this project?',
  );
  await tabTo(within(confirmation).getByRole('button', { name: 'Yes' }));
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.queryByRole('complementary')).not.toBeInTheDocument(),
  );
};

/**
 * The panel's confirmed Remove takes away the Edit that opened it, with the panel's closing: the
 * focus goes to the page's heading rather than falling to the document.
 */
export const RemoveFromKeyboard: Story = {
  play: async (context) => {
    const { canvas, canvasElement } = context;
    await removeBetaFromKeyboard(context);
    await expect(
      canvas.queryByRole('button', { name: 'Edit Beta' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toHaveFocus();
    await announcerCleared(canvasElement.ownerDocument);
  },
};

/**
 * The removal lands later, once the list is read again: the Edit that opened the panel is still on
 * the page when the panel closes, and the focus goes to the heading all the same, where it stays
 * when the row leaves.
 */
export const RemoveLandsLater: Story = {
  args: { refetchMs: 500 },
  play: async (context) => {
    const { canvas, canvasElement } = context;
    await removeBetaFromKeyboard(context);
    const heading = canvas.getByRole('heading', { level: 1, name: 'Projects' });
    await expect(heading).toHaveFocus();
    await expect(
      canvas.getByRole('button', { name: 'Edit Beta' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Edit Beta' }),
      ).not.toBeInTheDocument(),
    );
    await expect(heading).toHaveFocus();
    await announcerCleared(canvasElement.ownerDocument);
  },
};
