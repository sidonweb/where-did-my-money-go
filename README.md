# where did my money go?

A mobile-first, installable personal finance tracker for quickly logging expenses and seeing how spending compares against a simple 50 / 30 / 20 budget plan.

The app started as an Excel finance tracker and is now a full-stack open-source SaaS-style project with email accounts, PostgreSQL persistence, charts, CSV/JSON export, and PWA support.

## Features

- Email signup and login
- Password hashing with Node `scrypt`
- User-scoped settings and transactions
- Empty workspace for new users, so each person can set up their own income and limits
- Daily expense ledger with add, edit, delete, search, and CSV export
- Monthly dashboard that opens on the current month by default
- 50 / 30 / 20 budget projection
- Weekly spend analysis with filters
- Yearly calendar heatmap
- Editable categories and payment modes
- JSON backup/import
- Progressive Web App manifest and service worker
- Mobile-first responsive UI

## Tech Stack

- React
- TypeScript
- Vite
- Express
- PostgreSQL
- Docker Compose
- Recharts
- Lucide icons

## Quick Start

```bash
npm install
npm run db:up
npm run dev
```

Open the app:

```text
http://127.0.0.1:5173
```

For phone testing on the same Wi-Fi, use your machine's LAN IP:

```text
http://192.168.1.34:5173
```

## Environment

Copy `.env.example` to `.env` if you want to override defaults:

```text
PORT=8787
DATABASE_URL=postgres://trackyourmoney:trackyourmoney@localhost:5432/trackyourmoney
```

Local Docker Postgres defaults:

```text
database: trackyourmoney
user: trackyourmoney
password: trackyourmoney
port: 5432
```

## Scripts

```bash
npm run db:up      # Start PostgreSQL
npm run db:down    # Stop PostgreSQL and remove the compose network
npm run dev        # Start API and Vite client
npm run server     # Start API only
npm run client     # Start Vite client only
npm run build      # Build production frontend
npm run start      # Serve API and built frontend from dist
npm run lint       # Run lint checks
```

## Production Deployment

The production Express server serves both the API and the built React app from `dist`.

Generic Node + Postgres deployment:

```bash
npm ci
npm run build
npm start
```

Required environment variables:

```text
PORT=8787
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
```

Docker deployment:

```bash
docker build -t where-did-my-money-go .
docker run -p 8787:8787 \
  -e PORT=8787 \
  -e DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE" \
  where-did-my-money-go
```

Recommended platforms:

- Render
- Railway
- Fly.io
- A VPS with Node and PostgreSQL

Use HTTPS in production for the best mobile PWA install experience.

## PWA Install

On Android:

1. Open the deployed HTTPS URL in Chrome.
2. Tap the three-dot menu.
3. Tap **Install app** or **Add to Home screen**.

Local LAN HTTP is useful for testing the UI, but full PWA install behavior is most reliable over HTTPS.

## Database Notes

The API creates tables automatically on startup. New users start with:

- salary `0`
- weekly limit `0`
- no transactions
- default categories and payment modes

This keeps onboarding clean while still giving users enough structure to start tracking immediately.

## Contributing

Issues and pull requests are welcome.

Good first areas:

- OAuth providers
- recurring expenses
- budget alerts
- import from bank CSV formats
- richer onboarding
- test coverage

## License

MIT
