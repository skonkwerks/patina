import { ButtonBase } from '../../aria/button/base.tsx';
import { stepperStyles, stepStyles } from './styles.ts';

export type Step = Readonly<{
  /** The step's stable id. */
  id: string;
  /** The step's name, in words. */
  label: string;
  /** Why the step cannot be moved to now, as the dialog's own Back and Next say it; while it is given, the step is disabled and says why. */
  disabledReason?: string;
  /** The step cannot be moved to and there is nothing to say, such as while the dialog is at work. */
  isDisabled?: boolean;
}>;

export type StepperProps = {
  /** The steps, in order. */
  steps: readonly Step[];
  /** The id of the step the dialog is on. */
  currentStep: string;
  /** The steps' name, such as "Import steps": the list has no visible heading. */
  'aria-label': string;
  /** Moves to another step. It is not called for the current one, which there is no moving to. */
  onStepChange: (id: string) => void;
};

/**
 * The steps of a dialog of steps, under its title, in order, with the current one marked
 * (`aria-current="step"`). Each step is a button that moves to that step under the same rules as the
 * dialog's own Back and Next: a step that cannot be moved to is disabled and says why. The current
 * step stays a focusable button whose press does nothing, on purpose: the step that was pressed
 * keeps the focus once it becomes current, and `aria-current="step"` says that it is where the
 * dialog is, so it needs no reason of its own. An ordered list of buttons fits: no React Aria
 * widget is a sequence of independent actions in order.
 */
export const Stepper = ({
  steps,
  currentStep,
  'aria-label': ariaLabel,
  onStepChange,
}: StepperProps) => {
  return (
    <ol aria-label={ariaLabel} className={stepperStyles()}>
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        return (
          <li key={step.id}>
            <ButtonBase
              aria-current={isCurrent ? 'step' : undefined}
              // The current step is where the dialog is: there is no moving to it, and no reason why not.
              isDisabled={!isCurrent && step.isDisabled === true}
              disabledReason={isCurrent ? undefined : step.disabledReason}
              onPress={() => {
                if (!isCurrent) {
                  onStepChange(step.id);
                }
              }}
              styles={(state) => stepStyles({ ...state, isCurrent }).base()}
              pendingIndicator='leading'
              spinnerSize='sm'
            >
              <span aria-hidden className={stepStyles({ isCurrent }).number()}>
                {index + 1}
              </span>
              {step.label}
            </ButtonBase>
          </li>
        );
      })}
    </ol>
  );
};
