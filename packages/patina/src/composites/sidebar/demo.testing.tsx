import {
  IconBrain,
  IconFolder,
  IconHexagon,
  IconListCheck,
  IconServer2,
  IconSettings,
} from '@tabler/icons-react';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';

import { Link } from '../../aria/link/index.ts';
import { ThemeMode, type ThemeModeValue } from '../thememode/index.ts';
import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  useSidebar,
} from './index.ts';

/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.tsx`). An app's
 * sidebar contents: the brand, two groups of items (one current, one at work, one with an alert),
 * and a footer with a status and the theme mode. A router that only records the route keeps a
 * pressed item inside the story; the app passes its own route and remembers the collapsed state.
 */

/** A status line in the footer: words while open, its dot alone (the words kept for assistive technology) on the rail. */
const FooterStatus = () => {
  const { isCollapsed } = useSidebar();
  return (
    <span
      role='status'
      className='text-surface-foreground-muted flex min-w-0 items-center gap-2 text-sm'
    >
      <span aria-hidden className='bg-success size-2 shrink-0 rounded-full' />
      <span className={isCollapsed ? 'sr-only' : 'truncate'}>Connected</span>
    </span>
  );
};

export const DemoSidebar = ({
  initialRoute = '/projects',
  isInitiallyCollapsed = false,
}: {
  initialRoute?: string;
  isInitiallyCollapsed?: boolean;
}) => {
  const [route, setRoute] = useState(initialRoute);
  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);
  const [mode, setMode] = useState<ThemeModeValue>('system');
  return (
    <RouterProvider navigate={setRoute}>
      <Sidebar
        aria-label='Main'
        selectedRoute={route}
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
        collapseLabel='Collapse sidebar'
        expandLabel='Expand sidebar'
        header={
          <SidebarHeader
            brand={
              <Link href='/' className='flex items-center gap-2 font-semibold'>
                <IconHexagon aria-hidden className='size-7' />
                Studio
              </Link>
            }
            mark={
              <Link href='/' aria-label='Studio'>
                <IconHexagon aria-hidden className='size-7' />
              </Link>
            }
          />
        }
        footer={
          <>
            <FooterStatus />
            <ThemeMode
              aria-label='Theme'
              className='ms-auto'
              mode={mode}
              onModeChange={setMode}
              systemLabel='System'
              lightLabel='Light'
              darkLabel='Dark'
            />
          </>
        }
      >
        <SidebarGroup id='workspace' title='Workspace'>
          <SidebarItem
            href='/projects'
            icon={<IconFolder aria-hidden />}
            label='Projects'
            count='(2)'
          />
          <SidebarItem
            href='/jobs'
            icon={<IconListCheck aria-hidden />}
            label='Jobs'
            isPending
            pendingText='Working'
            isCurrentSection={route.startsWith('/jobs/')}
          />
        </SidebarGroup>
        <SidebarGroup id='manage' title='Manage'>
          <SidebarItem
            href='/nodes'
            icon={<IconServer2 aria-hidden />}
            label='Nodes'
            alert={{ tone: 'error', label: 'Failed' }}
          />
          <SidebarItem
            href='/models'
            icon={<IconBrain aria-hidden />}
            label='Models'
          />
          <SidebarItem
            href='/settings'
            icon={<IconSettings aria-hidden />}
            label='Settings'
          />
        </SidebarGroup>
      </Sidebar>
    </RouterProvider>
  );
};
