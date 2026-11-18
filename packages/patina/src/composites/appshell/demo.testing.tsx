import { useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbLink,
  Breadcrumbs,
} from '../../aria/breadcrumbs/index.ts';
import { Button } from '../../aria/button/index.ts';
import { GridList } from '../../aria/gridlist/index.ts';
import { Switch } from '../../aria/switch/index.ts';
import { ToastRegion } from '../../aria/toast/index.ts';
import { Page } from '../../page/index.ts';
import { GridListRow } from '../gridlistrow/index.ts';
import { InfoButton } from '../infobutton/index.ts';
import { DemoSidebar } from '../sidebar/demo.testing.tsx';
import { useCloseSidePanelWhenGone, useSidePanel } from '../sidepanel/index.ts';
import { EditForm, type Project } from './editform.testing.tsx';
import { AppShell } from './index.ts';

/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.tsx`). A small app on
 * the shell: the sidebar contents, a page of projects, its help, and an edit form in the side panel,
 * with a modal drawer opened from the form. `refetchMs` is how long the list takes to be read again
 * after a removal: 0 removes the row with the panel's closing, and more lands the removal later, as
 * a refetch does.
 */

const projects: Project[] = [
  { id: 'alpha', name: 'Alpha' },
  { id: 'beta', name: 'Beta' },
];

/** The page's help, opened in the same panel by its help control, which closes it again. */
const ProjectsHelp = () => {
  const panel = useSidePanel<true>();
  return (
    <>
      <InfoButton
        aria-label='Help with projects'
        aria-expanded={panel.isShowing}
        aria-controls={panel.panelId}
        onPress={(event) =>
          panel.toggle(true, { title: 'Help', trigger: event.target })
        }
      />
      {panel.render(
        <p className='text-sm'>
          A project collects the work for one launch. Edit one to rename it.
        </p>,
      )}
    </>
  );
};

const ProjectsPage = ({ refetchMs }: { refetchMs: number }) => {
  const [isBetaListed, setIsBetaListed] = useState(true);
  const [removedIds, setRemovedIds] = useState<readonly string[]>([]);
  const listed = projects.filter(
    (project) =>
      !removedIds.includes(project.id) &&
      (isBetaListed || project.id !== 'beta'),
  );
  const panel = useSidePanel<Project>();
  const shown = panel.surface;
  useCloseSidePanelWhenGone(
    panel,
    shown !== null && !listed.some((project) => project.id === shown.id),
  );
  return (
    <Page
      breadcrumbs={
        <Breadcrumbs aria-label='Breadcrumbs'>
          <Breadcrumb>
            <BreadcrumbLink href='#'>Home</BreadcrumbLink>
          </Breadcrumb>
          <Breadcrumb>
            <BreadcrumbLink>Projects</BreadcrumbLink>
          </Breadcrumb>
        </Breadcrumbs>
      }
      title='Projects'
      info={<ProjectsHelp />}
      actions={
        // Stands for a removal made elsewhere, which closes a panel showing the removed project.
        <Switch isSelected={isBetaListed} onChange={setIsBetaListed}>
          Beta is listed
        </Switch>
      }
    >
      <GridList
        aria-label='Projects'
        emptyState={{
          title: 'No projects',
          description: 'Projects you add appear here.',
        }}
      >
        {listed.map((project) => (
          <GridListRow
            key={project.id}
            id={project.id}
            title={project.name}
            actions={
              <Button
                size='sm'
                aria-label={`Edit ${project.name}`}
                onPress={(event) =>
                  panel.open(project, {
                    title: `Edit ${project.name}`,
                    trigger: event.target,
                  })
                }
              >
                Edit
              </Button>
            }
          />
        ))}
      </GridList>
      {shown !== null &&
        panel.render(
          <EditForm
            key={shown.id}
            project={shown}
            onDone={() => panel.close()}
            onRemoved={() => {
              panel.close({ isOpenerRemoved: true });
              const removeRow = () =>
                setRemovedIds((ids) => [...ids, shown.id]);
              if (refetchMs === 0) {
                removeRow();
              } else {
                window.setTimeout(removeRow, refetchMs);
              }
            }}
          />,
        )}
    </Page>
  );
};

export const Shell = ({ refetchMs = 0 }: { refetchMs?: number }) => (
  <div className='h-[34rem]'>
    <AppShell
      sidebar={<DemoSidebar />}
      panelCloseLabel='Close'
      notifications={
        <ToastRegion className='right-[calc(var(--side-panel-offset)+1rem)]' />
      }
    >
      <ProjectsPage refetchMs={refetchMs} />
    </AppShell>
  </div>
);
