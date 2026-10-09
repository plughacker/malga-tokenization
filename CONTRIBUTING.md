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
   yarn install
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
   yarn test

   # Build current code
   yarn build
   ```

   > Note: ensure your version of Node is 18 or higher to run scripts

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
