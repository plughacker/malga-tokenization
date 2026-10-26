# Contributing to Malga Node.js

Welcome and thanks for your interest! Before submitting a pull request, please take a moment to review these guidelines.

## Reporting Issues

Found a problem? Want a new feature?

- See if your issue or idea has [already been reported](https://github.com/plughacker/malga-tokenization/issues).
- Provide a [live example](https://codesandbox.io/).

Remember, a bug is a _demonstrable problem_ caused by _our_ code.

## Submitting Pull Requests

Pull requests are the greatest contributions, so be sure they are focused in
scope and avoid unrelated commits.

1. To begin: [fork this project](https://github.com/plughacker/malga-tokenization/fork), clone your fork, and add our upstream.

   ```bash
   # Clone your fork of the repo into the current directory
   git clone git@github.com:$(npx github-username-cli $(git config user.email))/malga-tokenization.git

   # Navigate to the newly cloned directory
   cd malga-tokenization

   # Assign the original repo to a remote called "upstream"
   git remote add upstream git@github.com:plughacker/malga-tokenization.git

   # Install the tools necessary for testing
   pnpm install
   ```

2. Create a branch for your feature or fix:

   ```bash
   # Move into a new branch for your feature
   git checkout -b feature/thing
   ```

   ```bash
   # Move into a new branch for your fix
   git checkout -b fix/something
   ```

3. If your code passes all the tests, then push your feature branch:

   ```bash
   # Test current code
   pnpm test:ci

   # Build current code
   pnpm build
   ```

   > Note: ensure your version of Node is 18 or higher to run scripts

   If the change affects the published package, add a changeset and commit it
   with your code:

   ```bash
   pnpm changeset
   ```

   The release only publishes to npm if the hosted-fields version in
   `src/constants/version.ts` (`HOSTED_FIELDS_VERSION`) is already live in
   production and sandbox (`pnpm check:hosted-fields`). `HOSTED_FIELDS_VERSION`
   is always a major (`x.0.0`): the hosted-fields republishes its minors and
   patches in `/x.0.0/`, so the check accepts a newer build of the same major
   there, never another major or an older one. Deploy the hosted-fields
   first; if the release job fails on this check, re-run it after the deploy.

   You rarely need to bump `HOSTED_FIELDS_VERSION` by hand: when the
   hosted-fields publishes a new major in production or sandbox, it runs the
   `atualizar-hosted-fields` workflow here, which opens (or updates) the PR
   `chore/hosted-fields-<version>` with the bump and a `patch` changeset. The PR
   stays a draft until the version is live in both environments. It never
   rewrites an existing branch, so if the new contract needs SDK changes,
   make them on that branch before merging, and adjust the changeset type if
   they are visible to SDK users. See
   [Hosted-fields version PRs](#hosted-fields-version-prs).

   ```bash
   # Push the branch for your new feature
   git push origin feature/thing
   ```

   ```bash
   # Or, push the branch for your update
   git push origin update/something
   ```

That’s it! Now [open a pull request](https://help.github.com/articles/using-pull-requests/) with a clear title and description.

## End-to-end tests

Pull requests from branches of this repository run an end-to-end suite (Playwright) that lives in
the private `client-hosted-fields` repository. The `e2e` workflow checks that
`URL_HOSTED_FIELD_DEV` in `src/constants/url.ts` is `https://hosted-fields.dev.malga.io`, then
dispatches the client workflow with the exact commit SHA of the PR. The client builds the SDK from
that SHA and runs the tests against the dev hosted-fields and dev API, and the result becomes the
`e2e / client` check of the PR.

- Keep `URL_HOSTED_FIELD_DEV` pointing to `http://localhost:5173` only for local work; switch it
  back before opening the PR.
- PRs from forks do not run the suite (no secrets). A maintainer can run the `e2e` workflow manually
  with the reviewed SHA.
- Required secret: `E2E_CLIENT_TOKEN` (GitHub App or fine-grained token with `Actions: read & write`
  on `client-hosted-fields` only).

## Hosted-fields version PRs

The `atualizar-hosted-fields` workflow (`.github/workflows/atualizar-hosted-fields.yml`) is
dispatched by the `malga-hosted-fields` deploy whenever production or sandbox publishes a new
major in `/x.0.0/`. It can also be run by hand from the Actions tab, with just the version.

- Only a major (`x.0.0`) opens a PR; any other version fails with a message. Minors and patches are
  republished in `/x.0.0/`, which the SDK already loads, so they reach merchants without an SDK
  release.

- Each run checks both environments with `scripts/check-hosted-fields.js`, the same check as the
  release. The first notice opens the PR as a draft; the one that completes the pair marks it ready.
- The PR is opened with `GITHUB_TOKEN`, so it does not trigger the `tests` and `e2e` checks. The
  workflow runs `pnpm test:ci` before pushing and runs the `e2e` workflow on the new commit itself.
  To get `e2e / client` as a PR check, close and reopen the PR.
- No new secret here: it uses `GITHUB_TOKEN` (`contents` and `pull-requests: write`) and the existing
  `E2E_CLIENT_TOKEN`. The dispatch needs `TOKENIZATION_DISPATCH_TOKEN` in `malga-hosted-fields`
  (GitHub App or fine-grained token with `Actions: read & write` on `malga-tokenization` only).
