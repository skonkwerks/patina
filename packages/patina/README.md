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
- **`internal/` is never a subpath.** A family re-exports an internal type its props use, such as `StatusTone` (from `chip` and `gauge`) and `DropFailureReason` (from `draganddrop` and `dropzone`).
- **Sorting a component:** if its root is a React Aria component (directly or through a base in its family), it goes in `aria/`. If it holds no React Aria component and no wrapper, it's a core family at the root of `src/`. If it combines several components into one arrangement, it goes in `composites/`.
- **A tier never imports from one above it:** `internal/` imports only `internal/`; a core family adds the other core families; `aria/` adds `aria/`; `composites/` may import anything in the package. ESLint enforces it (`import-x/no-restricted-paths`, `import-x/no-cycle`).
- **A family is a folder:** `index.ts` (its public surface), `component.tsx` (the main component), one file per further component (`table/column.tsx`, `table/row.tsx`), and the family's stories. Core components and composites keep their styles in the family's `styles.ts`; a React Aria wrapper exports its `{component}Styles` from its own file, or from its family's `styles.ts` when several of the family's components share the look (`button/styles.ts` for `Button`, `IconButton` and `LinkButton`; `togglegroup/styles.ts` for `Toggle` and `IconToggle`).
- **One subpath per family.** An app imports `@skonkwerks/patina/<family>` and never sees the tier. `pnpm exports` writes the `exports` map from the folders; `pnpm check` fails when it is out of date.

## The hard rule: no outside dependencies

The package imports only:

- `react` and `react-aria-components` (peer dependencies)
- `@tabler/icons-react` (peer dependency), for the icons the components draw, under Tabler's own names (`IconCheck`, `IconX`)
- `motion` (peer dependency, imported from `motion/react`), for motion that is part of a component's behavior, such as `PanScroll`'s glide
- `tailwind-variants`
- `cn` from `internal/cn.ts`, which is the only place `clsx` and `tailwind-merge` are used
- the package's own files

Nothing else, including no other icon or animation library. Two things enforce the rule:

1. **pnpm's strict resolution.** `package.json` lists only those dependencies, so any other import fails to resolve.
2. **ESLint.** A `no-restricted-imports` rule in the root `eslint.config.mjs` reports any other import in `packages/patina/src`. Stories may also import Storybook's types.

What the wrappers need beyond that is drawn in, not imported:

- **Spinner:** `Spinner` and `PendingStatus` (`src/spinner/`) are plain SVG.
- **Error notices:** `Table` and `GridList` take `error` as a `ReactNode`. The app renders its own notice (for example a `LoadFailure` with a retry button).

## Using it in an app

1. Add the dependency, with its peer dependencies (`react`, `react-aria-components`, `@tabler/icons-react`, `motion`, `tailwindcss`). While the package is private, install it through the workspace or a local link:

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

## Naming spec

Every component follows these rules. Familiar names come first: React Aria's own names, then the vocabulary of shadcn/ui and HeroUI. When a component breaks a rule, that's a bug.

### Color tokens

- A fill is `{name}`. Text on it is `{name}-foreground`, and quieter text on it is `{name}-foreground-muted`.
- **Layers:** `canvas`, `surface`, `overlay`, `input`. Each has `-foreground`, `-foreground-muted` (or `input-placeholder`) and `-border`. `surface` and `overlay` also have `-hover`, the highlight of a hovered or focused row or item on that layer.
- **Actions:** `primary`, `neutral`, `destructive`. Each has `-foreground` and `-hover`.
- **Statuses:** `info`, `success`, `warning`, and `destructive` for errors. Each has `-foreground` and `-tint`.
- **Other:** `focus-ring`, `scrim`.
- **Danger is always `destructive`:** the token, the Button `tone`, the `StatusTone` of `Chip` and `Gauge`, and `MenuItem`'s `isDestructive` all use it. It's never called `error` or `danger`.
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

- **`StatusTone`** is the other `tone`: what a state means, on a component that shows one (`Chip` and `Gauge` now; alerts later). Its values are `neutral`, `info`, `success`, `warning` and `destructive`. `neutral` draws the surface (a plain category), never the neutral button fill.
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
