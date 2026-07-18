# Contributing to Ledgr.

Thank you for helping improve Ledgr. Contributions of all sizes are welcome, including bug fixes, documentation, accessibility improvements, tests, UI refinements, and new features.

## Community Expectations

Be respectful, constructive, and patient. Discuss the work rather than the person, welcome different experience levels, and avoid sharing another person's private or financial information.

Harassment, discrimination, personal attacks, and abusive behavior are not acceptable.

## Before You Start

1. Search existing issues and pull requests to avoid duplicate work.
2. Open an issue before beginning a large feature, database change, or architectural refactor.
3. Keep each contribution focused on one problem.
4. Do not include unrelated formatting or dependency changes.

Small documentation corrections and clearly scoped bug fixes can usually be submitted directly.

## Local Development

### Prerequisites

- Node.js 24 or newer
- npm
- A PostgreSQL database

### Setup

1. Fork the repository and clone your fork.
2. Create a branch from the latest default branch.
3. Install dependencies:

```bash
npm install
```

4. Create your local environment file:

```bash
cp .env.example .env
```

PowerShell users can run:

```powershell
Copy-Item .env.example .env
```

5. Add a development PostgreSQL connection string to `.env`.
6. Start the app:

```bash
npm run dev
```

The server creates the required tables and indexes automatically. Use a development database and sample financial data only.

## Branch Names

Use a short, descriptive branch name with a suitable prefix:

```text
feature/salary-cycle-summary
fix/ledger-date-filter
docs/contribution-guide
refactor/settings-validation
```

## Coding Guidelines

- Keep TypeScript strict and avoid `any` unless it is genuinely necessary and explained.
- Preserve clear boundaries between client components, server code, and API handlers.
- Reuse existing UI components and design tokens before introducing new patterns.
- Maintain responsive behavior for both mobile and desktop layouts.
- Keep user-visible language concise and consistent with the existing application.
- Preserve backward compatibility for saved settings, transactions, and JSON backups.
- Validate untrusted request and import data on the server.
- Never log passwords, authentication tokens, database URLs, or financial records.
- Do not cache authenticated financial API responses in the service worker.
- Add comments only where they explain a non-obvious decision.

Follow the existing naming and import conventions in nearby files. Avoid broad mechanical rewrites in a feature or bug-fix pull request.

## Database Changes

Discuss schema changes in an issue before implementing them.

A database contribution should:

- Be safe for existing installations and user records.
- Avoid destructive migrations unless explicitly approved.
- Keep all user-owned records scoped to the authenticated user.
- Include validation and a clear migration or initialization strategy.
- Document rollback considerations when relevant.

## PWA Changes

PWA generation is disabled during development and enabled during production builds.

- Edit `next.config.mjs`, `public/manifest.json`, or source icon assets as appropriate.
- Do not commit generated `public/sw.js` or `public/workbox-*.js` files.
- Keep `/api/` requests network-only unless a reviewed offline-data design is introduced.
- Clear old service workers before diagnosing development caching problems.

## Validation

Run these checks before submitting a pull request:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Also manually verify the affected workflow at mobile and desktop widths. For PWA changes, run the production build and inspect the browser's Application panel.

If a check cannot be run locally, explain why in the pull request.

## Commits

Write short, imperative commit messages. Conventional Commit prefixes are encouraged:

```text
feat: add salary-cycle selector
fix: exclude income from spending totals
docs: expand local setup instructions
```

Keep commits understandable and avoid mixing unrelated changes.

## Pull Requests

Include:

- A concise description of the problem and solution.
- A linked issue when one exists.
- Testing and validation performed.
- Screenshots or recordings for visible UI changes.
- Notes about database, environment-variable, backup-format, or PWA changes.
- Any known limitations or follow-up work.

Before requesting review, confirm that:

- [ ] The change is focused and does not overwrite unrelated work.
- [ ] Linting passes.
- [ ] TypeScript validation passes.
- [ ] The production build passes.
- [ ] New behavior has been manually tested.
- [ ] Mobile and desktop layouts still work.
- [ ] Existing user data remains compatible.
- [ ] Documentation was updated when behavior changed.
- [ ] No secrets or personal financial data are included.

## Reporting Bugs

A useful bug report includes:

- A clear title and description.
- Exact reproduction steps.
- Expected and actual behavior.
- Browser, operating system, and device details.
- Relevant console or server errors.
- Sanitized screenshots when useful.

Never attach a real `.env` file, database dump, authentication token, or financial backup.

## Feature Requests

Explain the user problem before proposing an implementation. Include the expected workflow, important edge cases, and how the feature should interact with existing calendar-month and salary-cycle modes.

## Security Issues

Do not open a public issue for a suspected security vulnerability. Contact the repository maintainer privately through an available repository or profile contact channel, and include only the information needed to reproduce the issue safely.
