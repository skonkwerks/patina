import type { ReactNode } from 'react';

import { Header, type HeaderProps } from '../header/index.ts';
import { pageStyles } from './styles.ts';

type PageFrameProps = {
  /**
   * The page's trail, the first row of the page, such as `Breadcrumbs` that start at Home and end
   * with this page.
   */
  breadcrumbs: ReactNode;
  children: ReactNode;
  /**
   * What is said under the page's heading about the page itself, such as a failed refresh of what
   * it shows, which stays on screen. Every layout shows it.
   */
  notice?: ReactNode;
};

export type PageProps = PageFrameProps &
  Omit<HeaderProps, 'variant' | 'level'> &
  (
    | {
        /** The default: the full content width. */
        layout?: 'workbench';
        /**
         * A workbench that fills the window's height instead of scrolling as a whole: its last
         * child takes the height left under the heading (give it `min-h-0 flex-1`) and scrolls
         * inside itself, so its parts can scroll on their own.
         */
        fill?: boolean;
      }
    /** A centered narrow column, such as the page an unknown address shows. */
    | { layout: 'welcome' }
  );

/**
 * The one page frame: the trail on top, then the page's `Header`, its notice, and its content.
 * A page never builds its own heading or repeats the gutter; a variation of layout belongs here.
 */
export const Page = ({ breadcrumbs, children, notice, ...rest }: PageProps) => {
  if (rest.layout === 'welcome') {
    const { layout, ...header } = rest;
    const styles = pageStyles({ layout });
    return (
      <div className={styles.root()}>
        <div className={styles.frame()}>{breadcrumbs}</div>
        <div className={styles.welcomeBody()}>
          <div className={styles.welcomeColumn()}>
            <Header {...header} variant='page' />
            {notice}
            {children}
          </div>
        </div>
      </div>
    );
  }
  const { layout, fill = false, ...header } = rest;
  const styles = pageStyles({ layout, isFilling: fill });
  return (
    <div className={styles.root()}>
      <div className={styles.frame()}>
        <div className={styles.column()}>
          {breadcrumbs}
          <Header {...header} variant='page' />
          {notice}
          {children}
        </div>
      </div>
    </div>
  );
};
