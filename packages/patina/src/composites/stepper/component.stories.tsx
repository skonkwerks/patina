import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { type Step, Stepper, type StepperProps } from './index.js';

const steps: readonly Step[] = [
  { id: 'file', label: 'Choose a file' },
  { id: 'review', label: 'Review what was read' },
  { id: 'name', label: 'Name the import' },
];

const StepperWithState = (args: StepperProps) => {
  const [current, setCurrent] = useState(args.currentStep);
  return (
    <div className='bg-overlay max-w-xl rounded-lg border p-4'>
      <Stepper {...args} currentStep={current} onStepChange={setCurrent} />
    </div>
  );
};

const meta = {
  title: 'Composites/Stepper',
  component: Stepper,
  args: {
    steps,
    currentStep: 'review',
    'aria-label': 'Import steps',
    onStepChange: () => undefined,
  },
  render: (args) => <StepperWithState {...args} />,
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Whether a step's hover look has settled: React Aria reports the hover, and no color is still fading. */
const settledAfterHover = async (step: HTMLElement) => {
  await waitFor(async () => {
    await expect(step).toHaveAttribute('data-hovered', 'true');
    await expect(step.getAnimations()).toHaveLength(0);
  });
};

/**
 * Press a step to move to it; the current one is marked and keeps the focus. Pressing the current
 * step changes nothing.
 */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const review = canvas.getByRole('button', { name: 'Review what was read' });
    const name = canvas.getByRole('button', { name: 'Name the import' });
    await expect(review).toHaveAttribute('aria-current', 'step');

    await userEvent.click(name);
    await expect(name).toHaveAttribute('aria-current', 'step');
    await expect(review).not.toHaveAttribute('aria-current');
    await expect(name).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(name).toHaveAttribute('aria-current', 'step');
    await expect(review).not.toHaveAttribute('aria-current');
    await expect(name).toHaveFocus();

    // A step that can be moved to brightens under the pointer.
    const file = canvas.getByRole('button', { name: 'Choose a file' });
    const restingColor = getComputedStyle(file).color;
    await userEvent.hover(file);
    await settledAfterHover(file);
    await expect(getComputedStyle(file).color).not.toBe(restingColor);
  },
};

/** A step that cannot be moved to yet says why, on hover and focus; pressing it moves nowhere. */
export const WithDisabledReason: Story = {
  args: {
    currentStep: 'file',
    steps: [
      steps[0] ?? { id: 'file', label: 'Choose a file' },
      {
        id: 'review',
        label: 'Review what was read',
        disabledReason: 'Choose a file first.',
      },
      {
        id: 'name',
        label: 'Name the import',
        disabledReason: 'Choose a file first.',
      },
    ],
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body);
    const file = canvas.getByRole('button', { name: 'Choose a file' });
    const review = canvas.getByRole('button', { name: 'Review what was read' });

    await userEvent.tab();
    await expect(file).toHaveFocus();
    await userEvent.tab();
    await expect(review).toHaveFocus();
    await expect(await page.findByRole('tooltip')).toHaveTextContent(
      'Choose a file first.',
    );

    await userEvent.keyboard('{Enter}');
    await expect(file).toHaveAttribute('aria-current', 'step');
    await expect(review).not.toHaveAttribute('aria-current');

    // A step that cannot be moved to does not brighten under the pointer.
    const restingColor = getComputedStyle(review).color;
    await userEvent.hover(review);
    await settledAfterHover(review);
    await expect(getComputedStyle(review).color).toBe(restingColor);
  },
};

/** While the dialog is at work, no step can be moved to, and Tab passes over them. */
export const AtWork: Story = {
  args: {
    steps: steps.map((step) => ({ ...step, isDisabled: true })),
  },
  play: async ({ canvas, userEvent }) => {
    const current = canvas.getByRole('button', {
      name: 'Review what was read',
    });
    await userEvent.tab();
    await expect(current).toHaveFocus();
    await userEvent.tab();
    for (const name of ['Choose a file', 'Name the import']) {
      await expect(canvas.getByRole('button', { name })).not.toHaveFocus();
    }
    await expect(current).not.toHaveFocus();
  },
};
