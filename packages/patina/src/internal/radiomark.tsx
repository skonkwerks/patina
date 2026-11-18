import { radioMarkStyles } from './markstyles.js';

type RadioMarkProps = {
  size?: 'md' | 'sm';
  isSelected: boolean;
  /** The caller's layout and focus ring, merged into the circle. */
  className?: string;
};

/** The radio's mark (`radioMarkStyles`) drawn: its circle, and its dot while chosen. */
export const RadioMark = ({ size, isSelected, className }: RadioMarkProps) => {
  const mark = radioMarkStyles({ size, isSelected });
  return (
    <span className={mark.box({ className })}>
      <span className={mark.dot()} />
    </span>
  );
};
