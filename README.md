# Ledgr.

A mobile-first personal finance tracker for recording daily transactions, planning with the 50/30/20 rule, and understanding where income goes across calendar months or salary-to-salary budget cycles.

## Features

- Account-based authentication with private, per-user data.
- Daily ledger for expenses, savings, and income entries.
- Calendar-month and salary-cycle budgeting modes.
- 50/30/20 planning for Needs, Wants, and Savings.
- Dashboard KPIs, daily spending trends, category breakdowns, and financial score.
- Weekly, quarterly, custom-range, category, and payment-mode analysis.
- Yearly spending heatmap.
- Ask AI chat grounded in each signed-in user's own financial data through fixed, read-only tools.
- Configurable income plan, categories, payment modes, and themes.
- JSON backup and restore, plus CSV transaction export.
- Installable PWA with a production-generated service worker and offline application shell.
- Responsive desktop and mobile navigation.

## Technology

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- Tailwind CSS and shadcn/ui-style components
- PostgreSQL through `pg`
- Recharts
- Workbox through `@ducanh2912/next-pwa`

## Getting Started

### Requirements

- Node.js 24 or newer
- npm
- A PostgreSQL database, such as [Neon](https://neon.tech/)

### Installation

1. Fork or clone the repository.

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

On PowerShell, use:

```powershell
Copy-Item .env.example .env
```

4. Set your PostgreSQL connection string and server-only OpenAI API key in `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

Database tables and indexes are created automatically when the server first connects. Do not commit `.env` or any real database credentials.

### Ask AI plans (temporary billing stub)

New accounts use the `free` plan (3 Ask AI questions per UTC calendar day). The `pro` plan allows 12 questions per UTC calendar day. The app does not store a user timezone yet, so usage resets at midnight UTC and the exact reset time is shown in the UI.

Until billing is connected, plan changes are intentionally manual and must be made directly in PostgreSQL by an administrator:

```sql
update users set plan = 'pro' where email = 'person@example.com';
```

This is a temporary stub to replace with billing-provider entitlement updates (for example, Stripe webhooks). Never expose plan mutation as a public client API.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with Webpack and PWA generation disabled. |
| `npm run lint` | Run Oxlint against the `src` directory. |
| `npx tsc --noEmit` | Run strict TypeScript validation without emitting files. |
| `npm run build` | Create an optimized production build and generate the service worker. |
| `npm start` | Serve the completed production build. |

## Production and PWA Testing

The service worker is generated only during a production build:

```bash
npm run build
npm start
```

Open the browser developer tools and inspect **Application → Manifest** and **Application → Service Workers**. The generated `public/sw.js` and `public/workbox-*.js` files are intentionally ignored by Git.

If a production service worker was previously installed on `localhost`, unregister it or clear site data before returning to `npm run dev`.

## Project Structure

```text
public/                  PWA manifest and application icons
src/app/                 App Router layout, routes, and API handlers
src/components/          Shared layout, theme, and UI components
src/data/                Default categories and application constants
src/lib/server/          PostgreSQL, authentication, and persistence logic
src/screens/             Dashboard, Ledger, Analysis, Calendar, and Profile views
src/services/            Client-side API requests
src/types/               Shared TypeScript domain types
src/utils/               Formatting, identifiers, settings, and finance models
next.config.mjs          Next.js and production PWA configuration
```

## Data and Privacy Notes

- Financial data is stored in PostgreSQL and separated by user account.
- Passwords are hashed before storage.
- Authentication tokens and theme preference are stored on the current device.
- Financial API responses are excluded from PWA runtime caching.
- The OpenAI API key and all model calls stay server-side. The model receives only concise results from four fixed read-only functions and never receives database or SQL access.
- Ask AI conversation context is kept in browser memory only and limited to the six most recent messages sent with a question; full transcripts are not persisted.
- The offline shell does not provide offline database writes or synchronization.

Use development accounts and sample data when testing. Never include real financial exports, credentials, or database dumps in issues or pull requests.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening an issue or pull request.

Useful contributions include bug fixes, accessibility improvements, responsive UI refinements, tests, documentation, and carefully scoped finance features.

## Support

When reporting a bug, include reproduction steps, expected and actual behavior, browser and operating-system details, and screenshots when they help explain the problem. Remove all personal or financial information first.
