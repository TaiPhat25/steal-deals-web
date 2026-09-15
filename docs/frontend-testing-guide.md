# Frontend Testing Guide

This guide explains how to run the current Steal Deals frontend unit and
component tests. The suite uses Vitest, React Testing Library, and jsdom.
Backend integration tests and Playwright end-to-end tests will be documented
separately when those suites are added.

## Prerequisites

- Node.js 24
- npm
- The `steal-deals-web` repository

Check the installed versions:

```powershell
node --version
npm --version
```

After cloning the repository or pulling dependency changes, install the exact
versions recorded in `package-lock.json`:

```powershell
npm ci
```

The Next.js development server and backend services do not need to be running
for the current Vitest unit and component tests.

## Run All Tests In Watch Mode

```powershell
npm test
```

Vitest runs the tests and remains active. Relevant tests rerun when source or
test files are saved. Press `Ctrl+C` to stop watch mode.

Use watch mode while writing or debugging tests.

## Run All Tests Once

```powershell
npm run test:run
```

Vitest runs the full suite once and exits. Use this command before committing
and in CI pipelines.

## Run One Test File

Pass the test file path after `--`:

```powershell
npm run test:run -- components/login/SignInForm.test.tsx
```

Another example:

```powershell
npm run test:run -- components/login/PasswordField.test.tsx
```

## Run Tests Matching A Name

Use `-t` to select tests whose title contains a phrase:

```powershell
npm run test:run -- -t "should redirect a seller"
```

This is useful when debugging one case in a larger file.

## Run Lint Checks

Run ESLint across the frontend:

```powershell
npm run lint
```

Run ESLint for one test file:

```powershell
npm run lint -- components/login/SignInForm.test.tsx
```

Tests should pass both Vitest and ESLint before they are committed.

## Test File Locations

Unit and component tests are stored beside the source they test:

```text
components/login/
|-- SignInForm.tsx
|-- SignInForm.test.tsx
|-- PasswordField.tsx
`-- PasswordField.test.tsx
```

Shared test setup belongs in:

```text
test/setup.ts
```

Vitest configuration belongs in:

```text
vitest.config.mts
```

Vitest currently discovers files ending in:

```text
.test.ts
.test.tsx
```

## Test Structure

Each test should follow Arrange, Act, Assert:

```ts
it("describes one expected behavior", () => {
  // Arrange: prepare input, mocks, and rendered components.
  // Act: call the function or perform a user action.
  // Assert: verify the observable result.
});
```

Test behavior visible to a user or caller. Avoid assertions against private
implementation details, CSS class names, or internal React state unless those
details are part of a required contract.

Project test-count targets are:

- Small utility function: 15 tests
- React component: 10 tests
- API endpoint: 10 tests
- Playwright flow: 5 tests

These are coverage targets, not a reason to add duplicate or artificial cases.

## Recommended Pre-Commit Check

Run these commands from the frontend repository root:

```powershell
npm run lint
npm run test:run
npm run build
```

Do not commit generated test output, access tokens, API keys, real account
credentials, or test data containing personal information.

## Common Problems

### No test files found

Confirm that the filename ends in `.test.ts` or `.test.tsx` and is not inside
`node_modules`, `.next`, or another ignored output directory.

### Module or package cannot be found

Install the locked dependencies again:

```powershell
npm ci
```

### A test works alone but fails with the full suite

Check that mocks are reset in `beforeEach`, rendered components are cleaned up,
and the test does not depend on execution order or state from another test.

### A test waits indefinitely

Check that mocked promises resolve or reject, asynchronous UI updates use
`findBy...` or `waitFor`, and watch mode is not being mistaken for a completed
one-time run.
