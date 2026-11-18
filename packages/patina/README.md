# @skonkwerks/patina

Styled wrappers around [React Aria Components](https://react-spectrum.adobe.com/react-aria/), the core pieces they draw, and composite components built from both, themed with Tailwind CSS tokens. React Aria handles accessibility, keyboard behavior and focus. Patina adds one consistent look, and the app's theme decides every color.

## Layout

The source is sorted into tiers by what a component imports:

```
src/
├─ internal/      helpers every tier uses (cn, focus ring, disabled look, field looks); never a subpath
├─ <family>/      core components: no React Aria, no wrapper inside (spinner/, count/, emptystate/, …)
├─ aria/          React Aria wrappers: a component whose root is a React Aria component
└─ composites/    components that combine several others into one arrangement
```

- **What belongs in Patina:** a component belongs in Patina only if it is generally useful across applications; one specific to a single application stays in that application.
- **`internal/` is never a subpath.** A family re-exports an internal type its props use, such as `StatusTone` (from `chip`, `gauge`, `meter` and `alert`) and `DropFailureReason` (from `draganddrop` and `dropzone`).
- **Sorting a component:** if its root is a React Aria component (directly or through a base in its family), it goes in `aria/`. If it holds no React Aria component and no wrapper, it's a core family at the root of `src/`. If it combines several components into one arrangement, it goes in `composites/`.
- **A tier never imports from one above it:** `internal/` imports only `internal/`; a core family adds the other core families; `aria/` adds `aria/`; `composites/` may import anything in the package. ESLint enforces it (`import-x/no-restricted-paths`, `import-x/no-cycle`).
- **A family is a folder:** `index.ts` (its public surface), `component.tsx` (the main component), one file per further component (`table/column.tsx`, `table/row.tsx`), and the family's stories. Core components and composites keep their styles in the family's `styles.ts`; a React Aria wrapper exports its `{component}Styles` from its own file, or from its family's `styles.ts` when several of the family's components share the look (`button/styles.ts` for `Button`, `IconButton` and `LinkButton`; `togglegroup/styles.ts` for `Toggle` and `IconToggle`).
- **A custom button look builds on `ButtonBase`** (`aria/button/base.tsx`), the button family's internal base: React Aria's press handling, a disabled reason that keeps the button focusable, an optional tooltip, and a pending spinner, with the look left to the caller's `styles` function. `IconButton` and the composites with a button of their own look (`Stepper`'s steps, `StateDetails`' control, `SplitButton`'s parts) use it, so a button's state rules hold everywhere and no wrapper is restyled through `className`. It is not a public subpath.
- **An alpha subpath:** `@skonkwerks/patina/tokenfield` wraps React Aria's TokenField, which React Aria marks alpha. Until React Aria marks it stable, the subpath (the component, and the `TokenFieldValue` and segment types it re-exports for an app to build its value from) may change with any React Aria minor version that Patina's peer range allows, and the changelog says how.
- **One subpath per family.** An app imports `@skonkwerks/patina/<family>` and never sees the tier. `pnpm exports` writes the `exports` map from the folders; `pnpm check` fails when it is out of date.

## The hard rule: no outside dependencies

The package imports only:

- `react` and `react-aria-components` (peer dependencies)
- `react-dom` (peer dependency), for `createPortal` alone: the side panel renders a page's content into the shell's panel
- `@tabler/icons-react` (peer dependency), for the icons the components draw, under Tabler's own names (`IconCheck`, `IconX`)
- `motion` (peer dependency, imported from `motion/react`), for motion that is part of a component's behavior, such as `PanScroll`'s glide
- `tailwind-variants`
- `immer` (a dependency, not a peer: an internal detail), for the updates in Patina's reducers, such as the side panel's
- `cn` from `internal/cn.ts`, which is the only place `clsx` and `tailwind-merge` are used
- the package's own files

Nothing else, including no other icon or animation library. Two things enforce the rule:

1. **pnpm's strict resolution.** `package.json` lists only those dependencies, so any other import fails to resolve.
2. **ESLint.** A `no-restricted-imports` rule in the root `eslint.config.mjs` reports any other import in `packages/patina/src`. Stories may also import Storybook's types.

What the wrappers need beyond that is drawn in, not imported:

- **Spinner:** `Spinner` and `PendingStatus` (`src/spinner/`) are plain SVG.
- **Error notices:** `Table` and `GridList` take `error` as a `ReactNode`, because a wrapper cannot import a composite. The app passes Patina's `LoadFailure` (from `@skonkwerks/patina/loadstatus`), with its Retry.

## Using it in an app

1. Add the dependency, with its peer dependencies (`react`, `react-dom`, `react-aria-components`, `@tabler/icons-react`, `motion`, `tailwindcss`). While the package is private, install it through the workspace or a local link:

   ```json
   "@skonkwerks/patina": "link:../patina/packages/patina"
   ```

   A linked package resolves its own imports from patina's `node_modules`, so the app could end up with two copies of React and React Aria, which breaks hooks and context. Tell Vite to use the app's copies:

   ```ts
   // vite.config.ts
   export default defineConfig({
     resolve: {
       dedupe: [
         'react',
         'react-dom',
         'react-aria-components',
         '@tabler/icons-react',
         'motion',
       ],
     },
   });
   ```

   The date components (`DateField`, `TimeField`, `Calendar`, `RangeCalendar`, `DatePicker`, `DateRangePicker`) take and give `@internationalized/date` values, which they only pass through. An app that passes them a value builds it with `@internationalized/date` (`parseDate`, `today`) and installs that package itself, as React Aria's documentation says; Patina does not depend on it.

2. In the app's Tailwind entry CSS:

   ```css
   @import 'tailwindcss';
   @plugin 'tailwindcss-react-aria-components';
   @import '@skonkwerks/patina/patina.css';
   ```

   `patina.css` tells Tailwind to scan the components for their classes (`@source`). The `tailwindcss-react-aria-components` plugin gives the React Aria state variants the wrappers use (`selected:`, `hover:` and `disabled:` on React Aria's `data-*` attributes). The plugin is a dependency of the app's CSS, not of the wrappers.

3. Define the color tokens in the app's theme, once per mode. `patina.css` lists them all:

   ```css
   @theme inline {
     --color-surface: var(--my-surface);
     --color-surface-foreground: var(--my-surface-foreground);
     /* …every token patina.css lists */
   }
   ```

4. Import each component from its own path:

   ```tsx
   import { Button } from '@skonkwerks/patina/button';
   import { TextField } from '@skonkwerks/patina/textfield';
   import { GridList } from '@skonkwerks/patina/gridlist';
   import { GridListRow } from '@skonkwerks/patina/gridlistrow';
   ```

5. Render the app shell once, above every page, and let each page render a `Page`:

   ```tsx
   import { AppShell } from '@skonkwerks/patina/appshell';
   import {
     Sidebar,
     SidebarGroup,
     SidebarHeader,
     SidebarItem,
   } from '@skonkwerks/patina/sidebar';
   import { ThemeMode } from '@skonkwerks/patina/thememode';
   import { ToastRegion } from '@skonkwerks/patina/toast';

   <AppShell
     sidebar={
       <Sidebar
         aria-label='Main'
         selectedRoute={pathname}
         isCollapsed={isCollapsed}
         onCollapsedChange={setIsCollapsed}
         collapseLabel='Collapse sidebar'
         expandLabel='Expand sidebar'
         header={<SidebarHeader brand={<Logo />} mark={<LogoMark />} />}
         footer={
           <ThemeMode
             aria-label='Theme'
             mode={mode}
             onModeChange={setMode}
             {...themeLabels}
           />
         }
       >
         <SidebarGroup id='workspace' title='Workspace'>
           <SidebarItem
             href='/projects'
             icon={<IconFolder aria-hidden />}
             label='Projects'
           />
         </SidebarGroup>
       </Sidebar>
     }
     panelCloseLabel='Close'
     notifications={
       <ToastRegion className='right-[calc(var(--side-panel-offset)+1rem)]' />
     }
   >
     <Outlet />
   </AppShell>;
   ```

   The sidebar contents are the `Sidebar` frame (a `nav` with the header, the groups and the footer row, whose last control collapses it to a rail of icons), its `SidebarHeader` (the brand, or its mark on the rail), its `SidebarGroup`s of `SidebarItem`s (an icon and a name, with a count, a spinner or an alert mark; on the rail the name is the item's tooltip), and the footer, which holds the app's controls and Patina's `ThemeMode` (one icon button that moves through system, light and dark; it steps aside on the rail). A control that must change on the rail, such as a status line that hides its words there, reads `useSidebar()`. From the keyboard, the sidebar's items are one Tab stop, as React Aria's navigation tree makes a collection: the arrow keys move between the links, and Tab goes on to the footer. The app holds whether the sidebar is collapsed and the theme mode, and remembers them if it wants to; Patina stores nothing.

   A page shows its help, an item's details, or an edit form in the shell's side panel with `useSidePanel` (`@skonkwerks/patina/sidepanel`), and keeps it open while a write is pending with `useSidePanelHold`. The panel is 24rem wide; an app sets `--side-panel-width` to change it. The panel is not modal; a modal task uses `DialogModal`, centered or, with `placement='right'`, as a sheet at the right edge.

## Naming spec

Every component follows these rules. Familiar names come first: React Aria's own names, then the vocabulary of shadcn/ui and HeroUI. When a component breaks a rule, that's a bug.

### Color tokens

- A fill is `{name}`. Text on it is `{name}-foreground`, and quieter text on it is `{name}-foreground-muted`.
- **Layers:** `canvas`, `surface`, `overlay`, `input`. Each has `-foreground`, `-foreground-muted` (or `input-placeholder`) and `-border`. A layer's `-border` is a faint line that divides its rows, panels or a field's inner parts. `surface` and `overlay` also have `-hover`, the highlight of a hovered or focused row or item on that layer.
- **Actions:** `primary`, `neutral`, `destructive`. Each has `-foreground` and `-hover`; `destructive` also has `-tint`.
- **Statuses:** `info`, `success`, `warning`, `error`. Each has `-foreground` and `-tint`.
- **Controls:** `control-border`, the edge of a control: a field's box, a checkbox's or radio's mark, a switch's off track, a slider's rail, a color swatch, a color slider's track, a color area, a color wheel's track. It reaches 3:1 against every layer and hover fill it stands on (canvas, surface, surface-hover, overlay, overlay-hover, input), in every mode, as an interface component must.
- **Other:** `focus-ring`, the one keyboard focus ring, which reaches 3:1 against every layer and fill it stands on or is drawn over, in every mode (a focused option's ring is drawn over `overlay-hover`, or `surface-hover` in a list on the page, and a selected row's or tile's over `primary` at 10%, or 12% under the pointer, on `surface`); `scrim`.
- **Text takes the tokens of the layer it stands on.** A component that can stand on any layer either takes the color of where it stands (`Count`, at normal weight) or is given its layer by its caller. A few components stand on the page's background, the canvas, and only there, so they keep the `canvas` tokens: `Header` (a page's heading and a section's), `Breadcrumbs`, the `Tabs` list and its tabs, and `Disclosure`. Put one of them on a surface or an overlay and its text keeps the canvas colors.
- **`destructive` for actions, `error` for statuses.** `destructive` is an action that will destroy something: the Button `tone`, `MenuItem`'s `isDestructive`, and the `destructive*` tokens they draw. `error` is a status, something that already went wrong: the `StatusTone` of `Chip`, `Gauge`, `Meter` and `Alert` (and the subset `StateDetails` takes; `LoadFailure` draws an error `Alert`), a field's error text and invalid border, and the `error*` tokens they draw. Neither is ever called `danger`.
- **Disabled is one rule everywhere:** `opacity-50` and `cursor-not-allowed`, defined once as `DISABLED` in `src/internal/disabled.ts` and given as the `true` value of each component's `isDisabled` variant. It is applied to the control and its label, part by part, never to a container around faded parts (two fades would compound). Text that is not the label of a disabled control (a description, an error, a slider's value) keeps its contrast. One exception: a slider's label also keeps its contrast, because it names the thumb's input through `aria-labelledby` rather than `for`, so the automated contrast check cannot tell it belongs to a disabled control; the slider's rail and thumb show that it is disabled. There's no `-disabled` token.

`patina.css` lists the full contract.

### Look props

Every button-like component (`Button`, `IconButton`, `LinkButton`, `Toggle`, `IconToggle`) uses the same words:

| Prop      | Values                              | Meaning                                                                         |
| --------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `variant` | `solid`, `outline`, `ghost`, `link` | How it looks. Toggles use `outline` and `ghost`.                                |
| `tone`    | `neutral`, `primary`, `destructive` | What it means.                                                                  |
| `size`    | `sm`, `md`, `lg`                    | The one control scale: **28px, 32px (default), 36px**. Compact, for dashboards. |
| `radius`  | `md`, `full`                        | Rounded corners, or a pill (a circle on an `IconButton`).                       |

- **`StatusTone`** is the other `tone`: what a state means, on a component that shows one (`Chip`, `Gauge`, `Meter` and `Alert`; `StateDetails` and `Toast` take the subset that suits them). Its values are `neutral`, `info`, `success`, `warning` and `error` (a status, never `destructive`, which is an action). `neutral` draws the surface (a plain category), never the neutral button fill.
- **Text or icon is a choice of component, not a prop.** `Button` and `Toggle` hold a text label (optionally with an icon beside it). A control that shows only an icon is an `IconButton` or `IconToggle`: a square (or a circle with `radius='full'`) of the size's height, with `aria-label` required by its type. There is no `isIconOnly` switch.
- **Defaults:** `variant='outline'`, `tone='neutral'`, `size='md'`, `radius='md'`. `IconButton` defaults to `variant='ghost'`.
- **A round ghost button on a surface,** such as a close button: `<IconButton radius='full' aria-label='Close'>`.
- **Text fields, selects and other inputs** are 32px tall, the same as an `md` button.
- **Other components that take a `size`** use the same `sm | md | lg` words, for example `Spinner` and `InlineMetadata`. A width is never called `size`: Table's `Column` takes `width`.

### Props

- **Booleans** start with `is`, `has` or `allows`, as in React Aria: `isPending`, `isDisabled`, `isDismissable`, `hasTooltip`, `hasActionSpace`, `hasValueOutput`, `allowsWrapping`. Never a bare adjective (`small`, `ghost`) or a verb phrase (`holdsWork`).
- **Pending:** `isPending` plus `pendingText` everywhere. There's no `loadingText` and no string `pending`.
- **Text:**
  - Fields: `label`, `description`, `errorMessage`, `placeholder`, and `contextualHelp` for a help control next to the label.
  - Containers (dialogs, sections, rows, empty states): `title` and `description`.
  - An accessible name with no visible text: `aria-label`.
  - Localized text for an inner control: `{control}Label` (`closeLabel`, `clearLabel`, `searchLabel`).
- **Slots (ReactNode props)** are named by meaning, and plural for groups: `actions`, `badges`, `media`, `endContent`, `headerContent`, `contextualHelp`.
- **Errors in a collection:** `error`, a ReactNode the app renders.

### Styles

- Every component's look is an exported `tv()` named `{component}Styles` (`buttonStyles`, `dialogStyles`, `tableCellStyles`), so an app can extend a look without forking the component.
- Multi-part components use `slots`.
- State variants use React Aria's render-state names (`isSelected`, `isHovered`, `isFocusVisible`, `isDisabled`).

### Components and files

- **Component names follow React Aria** where one exists (`Button`, `Dialog`, `GridList`, `Table`). Otherwise use the common name: `Spinner`, `ActionMenu`, `EmptyState`.
- **File names and import paths have no hyphens:** `textfield`, `iconbutton`, `draganddrop`; inside a family, `table/header.tsx`, `gridlist/loadmore.tsx`.

## Viewing the components

Every component has stories next to it (`*.stories.tsx`). From the repository root:

```sh
pnpm storybook
```

Storybook opens at http://localhost:6006 with a light/dark switch in the toolbar. Each story is checked for accessibility with axe in the Accessibility panel.
