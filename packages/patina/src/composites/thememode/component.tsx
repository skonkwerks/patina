import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useId } from 'react';

import { IconButton } from '../../aria/iconbutton/index.ts';
import { useSidebar } from '../sidebar/index.ts';
import { themeModeStyles } from './styles.ts';

/** How the app chooses its theme: following the operating system, or always light or dark. */
export type ThemeModeValue = 'system' | 'light' | 'dark';

/** Each mode and the one a press moves to: system, light, dark, then system again. */
const NEXT: Readonly<Record<ThemeModeValue, ThemeModeValue>> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const ICONS = { system: IconDeviceDesktop, light: IconSun, dark: IconMoon };

export type ThemeModeProps = {
  /** The control's name, which stays the same whatever the mode, such as "Theme". */
  'aria-label': string;
  /** The mode in use; the app holds it, applies it, and remembers it if it wants to. */
  mode: ThemeModeValue;
  /** Called with the next mode in the cycle when the control is pressed. */
  onModeChange: (mode: ThemeModeValue) => void;
  /** The words for the mode that follows the operating system, such as "System". */
  systemLabel: string;
  /** The words for the light mode, such as "Light". */
  lightLabel: string;
  /** The words for the dark mode, such as "Dark". */
  darkLabel: string;
  /** Layout only, such as `ms-auto` to stand at the end of a row; merged last. */
  className?: string;
};

/**
 * The theme mode: one icon button that shows the mode in use (a monitor for following the system,
 * a sun, a moon) and moves to the next on each press: system, light, dark, then system again
 * (owner's decision, 2026-11-18). Its name stays the same, shown as its tooltip on hover and focus,
 * since a label does not change with the state it controls; the mode in use is its description,
 * in words. In the sidebar's footer it steps aside on the collapsed rail, as the theme is a rare
 * choice; it reads `useSidebar()` for that, so every app gets the same behavior. Anywhere else it
 * always shows.
 */
export const ThemeMode = ({
  'aria-label': label,
  mode,
  onModeChange,
  systemLabel,
  lightLabel,
  darkLabel,
  className,
}: ThemeModeProps) => {
  const { isCollapsed } = useSidebar();
  const descriptionId = useId();
  if (isCollapsed) {
    return null;
  }
  const styles = themeModeStyles();
  const Icon = ICONS[mode];
  const modeLabels = {
    system: systemLabel,
    light: lightLabel,
    dark: darkLabel,
  };
  return (
    <>
      <IconButton
        aria-label={label}
        aria-describedby={descriptionId}
        hasTooltip
        className={className}
        onPress={() => onModeChange(NEXT[mode])}
      >
        <Icon aria-hidden className={styles.icon()} />
      </IconButton>
      {/* The mode in use, in words, for assistive technology: the button's description. */}
      <span id={descriptionId} hidden>
        {modeLabels[mode]}
      </span>
    </>
  );
};
