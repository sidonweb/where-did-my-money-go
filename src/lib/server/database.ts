import { Pool } from 'pg'

type DatabaseGlobal = typeof globalThis & {
  moneyDatabaseInit?: Promise<void>
  moneyDatabasePool?: Pool
  moneyDatabaseVersion?: number
}

const databaseGlobal = globalThis as DatabaseGlobal
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Add your Neon connection string to .env.')
}

export const pool = databaseGlobal.moneyDatabasePool ?? new Pool({ connectionString })
const databaseVersion = 3

if (process.env.NODE_ENV !== 'production') {
  databaseGlobal.moneyDatabasePool = pool
}

export function ensureDatabase() {
  if (!databaseGlobal.moneyDatabaseInit || (databaseGlobal.moneyDatabaseVersion ?? 0) < databaseVersion) {
    databaseGlobal.moneyDatabaseInit = initializeDatabase().then(() => {
      databaseGlobal.moneyDatabaseVersion = databaseVersion
    })
  }
  return databaseGlobal.moneyDatabaseInit
}

async function initializeDatabase() {
  await pool.query(`
    create table if not exists users (
      id uuid primary key,
      email text not null unique,
      name text not null,
      password_hash text not null,
      plan text not null default 'free' check (plan in ('free', 'pro')),
      created_at timestamptz not null default now()
    );

    create table if not exists user_sessions (
      token text primary key,
      user_id uuid not null references users(id) on delete cascade,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null
    );

    create table if not exists user_settings (
      user_id uuid primary key references users(id) on delete cascade,
      data jsonb not null,
      updated_at timestamptz not null default now()
    );

    create table if not exists transactions (
      id uuid primary key,
      user_id uuid references users(id) on delete cascade,
      transaction_date date not null,
      description text not null,
      category_id text not null,
      amount numeric(14, 2) not null check (amount >= 0),
      payment_mode text not null,
      notes text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists ai_daily_usage (
      user_id uuid not null references users(id) on delete cascade,
      usage_date date not null,
      request_count integer not null default 0 check (request_count >= 0),
      updated_at timestamptz not null default now(),
      primary key (user_id, usage_date)
    );

    create table if not exists ai_decline_logs (
      id bigserial primary key,
      user_id uuid not null references users(id) on delete cascade,
      question_excerpt text not null,
      reason text not null,
      created_at timestamptz not null default now()
    );

    create index if not exists transactions_date_idx on transactions (transaction_date desc);
    create index if not exists transactions_category_idx on transactions (category_id);
    create index if not exists transactions_payment_mode_idx on transactions (payment_mode);
  `)
  await pool.query("alter table users add column if not exists plan text not null default 'free'")
  await pool.query("alter table users drop constraint if exists users_plan_check")
  await pool.query("alter table users add constraint users_plan_check check (plan in ('free', 'pro'))")
  await pool.query('alter table transactions add column if not exists user_id uuid references users(id) on delete cascade')
  await pool.query('create index if not exists transactions_user_id_idx on transactions (user_id)')
  await pool.query('create index if not exists ai_decline_logs_user_created_idx on ai_decline_logs (user_id, created_at desc)')
  await pool.query('delete from user_sessions where expires_at < now()')
}
