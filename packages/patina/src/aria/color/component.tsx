import { type ReactNode, useId } from 'react';
import {
  Button as AriaButton,
  type Color,
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
  Dialog as AriaDialog,
  DialogTrigger,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { useDescriptionId } from '../../internal/descriptionid.ts';
import { fieldBoxStyles, fieldStyles } from '../../internal/field.ts';
import {
  FieldHeader,
  type FieldHeaderProps,
} from '../../internal/fieldheader.tsx';
import { Popover } from '../popover/index.ts';
import { ColorArea } from './area.tsx';
import { ColorField } from './field.tsx';
import { ColorSlider } from './slider.tsx';
import { ColorSwatch } from './swatch.tsx';

export const colorPickerStyles = tv({
  slots: {
    value: 'flex min-w-0 items-center gap-2',
    // A swatch smaller than the control scale, inside the trigger's box.
    swatch: 'size-5',
    valueText: 'tabular-nums',
    popover: 'p-3',
    dialog: 'flex flex-col gap-3 outline-0',
    // The default content's slider and field are as wide as its color area.
    control: 'w-48',
  },
});

/** The trigger: the shared field box, as wide as what it shows. */
export const colorPickerTriggerStyles = tv({
  extend: fieldBoxStyles,
  base: 'hover:bg-surface-hover inline-flex h-8 cursor-pointer items-center self-start px-2',
});

export type ColorPickerProps = Omit<AriaColorPickerProps, 'children'> &
  (
    | {
        /** The field's visible label, such as "Fill": it names the trigger and the popover. */
        label: string;
        'aria-label'?: undefined;
      }
    | {
        label?: undefined;
        /** The field's name without a visible label, for a picker in a toolbar. */
        'aria-label': string;
      }
  ) &
  (
    | {
        /**
         * What the popover holds: the family's controls (`ColorArea`, `ColorSlider`, `ColorWheel`,
         * `ColorField`, `ColorSwatchPicker`), which all edit the picker's color.
         */
        children: ReactNode;
        hexFieldLabel?: undefined;
      }
    | {
        children?: undefined;
        /**
         * The label of the hex field in the default content, such as "Hex". Without `children`,
         * the popover holds a saturation and brightness area, a hue slider, and this hex field. It
         * edits an opaque color: React Aria's hex field has no alpha, so a hex typed in it makes
         * the color opaque. A picker for translucent colors passes `children` with a
         * `ColorSlider channel='alpha'`, which shows the alpha and sets it again.
         */
        hexFieldLabel: string;
      }
  ) &
  FieldHeaderProps & {
    /** Whether the trigger is locked, such as while a write that uses the color is pending. */
    isDisabled?: boolean;
    /** Placement only. */
    className?: string;
  };

/** The color as the trigger writes it: hex, with the alpha only when the color is translucent. */
const colorText = (color: Color) =>
  color.toString(color.getChannelValue('alpha') < 1 ? 'hexa' : 'hex');

/**
 * A color field under the shared field header: a trigger that shows the color as a swatch and as
 * hex, opening a popover whose controls all edit that one color (React Aria's `ColorPicker` keeps
 * them in step). The trigger's accessible name is the field's name, then the color in words and its
 * hex ("Fill vibrant cyan blue #1E66F5"), so the color is never told by the swatch alone; a
 * translucent color's hex carries its alpha ("#1E66F580"); its description is the field's
 * `description`, which the picker wires itself, as React Aria's `ColorPicker` is not a field.
 * Escape or a press outside closes the popover and gives the focus back to the trigger.
 *
 * A hex field makes the color opaque: React Aria's hex field has no alpha, so a hex typed in it, in
 * the default content or in `children`, drops the alpha. A picker for translucent colors holds a
 * `ColorSlider channel='alpha'` in its `children`, which shows the alpha and sets it again.
 */
export const ColorPicker = ({
  label,
  'aria-label': ariaLabel,
  optionalText,
  info,
  description,
  children,
  hexFieldLabel,
  isDisabled = false,
  className,
  ...props
}: ColorPickerProps) => {
  const labelId = useId();
  const nameId = useId();
  const valueId = useId();
  const { descriptionId, 'aria-describedby': describedBy } =
    useDescriptionId(description);
  const styles = colorPickerStyles();
  return (
    <AriaColorPicker {...props}>
      {({ color }) => (
        <div className={fieldStyles().root({ className })}>
          <FieldHeader
            label={label}
            labelId={labelId}
            optionalText={optionalText}
            info={info}
            description={description}
            descriptionId={descriptionId}
            isDisabled={isDisabled}
          />
          <DialogTrigger>
            <AriaButton
              isDisabled={isDisabled}
              aria-labelledby={`${label === undefined ? nameId : labelId} ${valueId}`}
              aria-describedby={describedBy}
              className={(renderProps) => colorPickerTriggerStyles(renderProps)}
            >
              {label === undefined && (
                <span id={nameId} hidden>
                  {ariaLabel}
                </span>
              )}
              {/* The swatch takes the picker's color; React Aria names it for the color in words. */}
              <span id={valueId} className={styles.value()}>
                <ColorSwatch className={styles.swatch()} />
                <span className={styles.valueText()}>{colorText(color)}</span>
              </span>
            </AriaButton>
            <Popover placement='bottom start' className={styles.popover()}>
              <AriaDialog
                aria-label={label ?? ariaLabel}
                className={styles.dialog()}
              >
                {children ?? (
                  <>
                    <ColorArea
                      colorSpace='hsb'
                      xChannel='saturation'
                      yChannel='brightness'
                    />
                    <ColorSlider
                      colorSpace='hsb'
                      channel='hue'
                      className={styles.control()}
                    />
                    <ColorField
                      label={hexFieldLabel}
                      className={styles.control()}
                    />
                  </>
                )}
              </AriaDialog>
            </Popover>
          </DialogTrigger>
        </div>
      )}
    </AriaColorPicker>
  );
};
