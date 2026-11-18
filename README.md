# patina

Shared React components for the owner's web apps, built on React, [React Aria Components](https://react-spectrum.adobe.com/react-aria/) and Tailwind CSS. Each app installs them as packages and uses its own theme, so a fix made here reaches every app.

| Path              | Package              | What it holds                                                                                                                                                                                                                                                          |
| ----------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/patina` | `@skonkwerks/patina` | React Aria Components wrappers, the core pieces they draw, and composite components. No dependencies beyond React and React DOM, React Aria, Tabler icons, Motion, `tailwind-variants` (with `tailwind-merge`) and Immer. See its [README](packages/patina/README.md). |
| `apps/storybook`  | (not published)      | Storybook, for viewing every component's states in light and dark.                                                                                                                                                                                                     |

Composite components live in the same package, in `packages/patina/src/composites/` ([Layout](packages/patina/README.md#layout)).

The naming spec is in [packages/patina/README.md](packages/patina/README.md#naming-spec).

## Commands

```sh
just setup            # link the shared guidelines, install Playwright's Chromium for the story tests
pnpm install
pnpm storybook        # Storybook at http://localhost:6006
pnpm check            # check the exports map, then type-check every workspace and the root scripts
pnpm exports          # rewrite packages/patina's exports map from its component folders
pnpm lint             # oxlint, the fast lint pass
pnpm lint:es          # ESLint, the full pass, including the aria dependency rule
pnpm lint:fix         # fix import order and braces in the React workspaces, then format
pnpm format           # Prettier, on the project's file types
pnpm test             # unit specs, and every story in Chromium with the axe accessibility check
pnpm build            # compile packages/patina into its dist/ (JavaScript and type definitions)
pnpm check:package    # pack packages/patina, check the tarball, and install it into a throwaway app
just ci-local         # every check above (check, both lint passes, format check, tests, packaging check): the gate before every commit
```

## License

[MIT](LICENSE).
