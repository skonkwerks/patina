# AGENTS.md

@.documents/guidelines/general/core/conduct.md

Read `.documents/guidelines/general/README.md` and `.documents/guidelines/general/core/` before the first change in a session: they hold the non-negotiable rules, which override everything else, and the workflow every change follows. If `.documents/guidelines/general/` is missing, run `just setup`; work does not start without it, and `just check-guidelines` says whether it is there. Patina keeps no `.documents/` of its own: the link is its only content, and the whole folder is untracked. Patina's own guidelines, which add to the shared ones and name any shared rule they depart from, are in `.sessions/guidelines/project.md`.

## In Patina

- **Patina is a public library, and its notes are private.** It is the shared UI package the owner's web applications install (`@skonkwerks/patina`, MIT). Everything committed is public: no private paths, hosts, or details of the owner's other projects in committed files. Every note, decision, changelog, and Patina's own guidelines live in `.sessions/`, which is not tracked; there is no `.documents/` (only the guidelines link, untracked).
- **Session context:** on a fresh session, first read the newest handoff in `.sessions/`, then the workstream document for the task.
- **The naming spec** in [packages/aria/README.md](packages/aria/README.md#naming-spec) governs every component name, prop, variant, and color token. Every rename is recorded in `.sessions/changelog.md`, which is how the applications migrate.
- **The aria dependency rule:** the wrappers import only `react`, `react-aria-components`, `tailwind-variants`, and `cn` ([packages/aria/README.md](packages/aria/README.md#the-hard-rule-no-outside-dependencies)). ESLint and pnpm enforce it.
- **The full validation pass** is `just ci-local`.
