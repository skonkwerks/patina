import { IconChevronRight } from '@tabler/icons-react';
import { Button, Heading } from 'react-aria-components';

import { focusRing } from '../../internal/focus.ts';
import { disclosureStyles } from './component.tsx';

const styles = disclosureStyles();

export type DisclosureHeaderProps = {
  /** The heading text. */
  children: string;
  /** The heading level in the page outline: 2 for a section of the page, 3 for one nested in a section. */
  level?: 2 | 3 | 4 | 5 | 6;
};

/** The section's heading, which is the button that opens and closes the panel. */
export const DisclosureHeader = ({
  children,
  level = 2,
}: DisclosureHeaderProps) => (
  <Heading level={level} className={styles.heading()}>
    <Button
      slot='trigger'
      className={(renderProps) =>
        styles.trigger({
          isDisabled: renderProps.isDisabled,
          className: focusRing(renderProps),
        })
      }
    >
      <IconChevronRight aria-hidden className={styles.chevron()} />
      <span className={styles.title()}>{children}</span>
    </Button>
  </Heading>
);
