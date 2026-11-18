# Patina's recipes. Names match the owner's other projects for like operations (setup, ci-local).

# The machine's one clone of the shared guidelines (docs/linking.md in the guidelines).
guidelines_dir := env('GUIDELINES_DIR', home_directory() / 'code' / 'guidelines')

# Links the shared guidelines into .documents/guidelines/general. The clone must already exist:
# patina is public and does not record the guidelines repository's address.
setup:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f "{{guidelines_dir}}/core/conduct.md" ]; then
      echo "No guidelines clone at {{guidelines_dir}}: clone the guidelines repository there, or set GUIDELINES_DIR." >&2
      exit 1
    fi
    if [ -e .documents/guidelines/general ] && [ ! -L .documents/guidelines/general ]; then
      echo ".documents/guidelines/general is a real folder, not the link; move it aside first." >&2
      exit 1
    fi
    mkdir -p .documents/guidelines
    ln -sfn "{{guidelines_dir}}" .documents/guidelines/general
    # The story tests run every story in headless Chromium; Playwright keeps the browser in its own cache.
    pnpm install
    pnpm --filter @skonkwerks/storybook exec playwright install chromium

# Fails when the shared guidelines are missing, so no session runs without the non-negotiable rules.
check-guidelines:
    @test -f .documents/guidelines/general/core/conduct.md || { echo ".documents/guidelines/general is missing or broken: run just setup." >&2; exit 1; }

# The automated half of the full validation pass before every commit (auto-sde is the other), and the gate before a push: type check, both lint passes, format check, every test (the unit specs and every story in Chromium with its axe check, light theme), and the packaging check (the build, packed and installed into a throwaway app).
ci-local: check-guidelines
    pnpm check
    pnpm lint
    pnpm lint:es
    pnpm format:check
    pnpm test
    pnpm check:package
