# Where did my money go?

A personal finance tracker built with Next.js, Tailwind CSS, shadcn/ui, and PostgreSQL.

## Run locally

Requirements:

- Node.js 24 or newer
- A Neon PostgreSQL database

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Use the connection string from the Neon dashboard as `DATABASE_URL`.

3. Start the application:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

The database tables are created automatically when the server starts.

## Production

```bash
npm run build
npm start
```

## Scripts

```text
npm run dev     Start the Next.js application
npm run build   Create a production build
npm start       Run the production build
npm run lint    Run lint checks
```

The API is implemented with Next.js Route Handlers under `src/app/api`.
