import 'dotenv/config'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import cors from 'cors'
import express from 'express'
import pg from 'pg'
import { buildEmptyState } from './seed.mjs'

const { Pool } = pg
const scrypt = promisify(crypto.scrypt)
const port = Number(process.env.PORT ?? 8787)
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgres://trackyourmoney:trackyourmoney@localhost:5432/trackyourmoney'
const host = process.env.HOST ?? '0.0.0.0'

const app = express()
const pool = new Pool({ connectionString: databaseUrl })
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', async (_request, response, next) => {
  try {
    await pool.query('select 1')
    response.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/signup', async (request, response, next) => {
  try {
    const { email, password, name } = request.body
    const user = await createUser({ email, password, name })
    const token = await createSession(user.id)
    response.status(201).json({ token, user, state: await getState(user.id) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const { email, password } = request.body
    const user = await verifyLogin(email, password)
    const token = await createSession(user.id)
    response.json({ token, user, state: await getState(user.id) })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', requireAuth, async (request, response, next) => {
  try {
    response.json({ user: request.user, state: await getState(request.user.id) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', requireAuth, async (request, response, next) => {
  try {
    await pool.query('delete from user_sessions where token = $1', [request.token])
    response.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/state', requireAuth, async (request, response, next) => {
  try {
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.put('/api/settings', requireAuth, async (request, response, next) => {
  try {
    await saveSettings(request.user.id, request.body)
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.post('/api/transactions', requireAuth, async (request, response, next) => {
  try {
    await upsertTransaction(request.user.id, request.body)
    response.status(201).json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.put('/api/transactions/:id', requireAuth, async (request, response, next) => {
  try {
    await upsertTransaction(request.user.id, { ...request.body, id: request.params.id })
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/transactions/:id', requireAuth, async (request, response, next) => {
  try {
    await pool.query('delete from transactions where id = $1 and user_id = $2', [request.params.id, request.user.id])
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.post('/api/import', requireAuth, async (request, response, next) => {
  try {
    validateState(request.body)
    await replaceState(request.user.id, request.body)
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.post('/api/reset', requireAuth, async (request, response, next) => {
  try {
    await replaceState(request.user.id, buildEmptyState())
    response.json(await getState(request.user.id))
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    error: error instanceof Error ? error.message : 'Unexpected server error',
  })
})

app.use(express.static(distDir))
app.get(/^(?!\/api).*/, (_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'))
})

try {
  await initDatabase()
  app.listen(port, host, () => {
    console.log(`where did my money go? listening on ${host}:${port}`)
  })
} catch (error) {
  console.error('Failed to start where did my money go?')
  console.error(error)
  process.exit(1)
}

async function initDatabase() {
  await pool.query(`
    create table if not exists users (
      id uuid primary key,
      email text not null unique,
      name text not null,
      password_hash text not null,
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

    create index if not exists transactions_date_idx on transactions (transaction_date desc);
    create index if not exists transactions_category_idx on transactions (category_id);
    create index if not exists transactions_payment_mode_idx on transactions (payment_mode);
  `)
  await pool.query('alter table transactions add column if not exists user_id uuid references users(id) on delete cascade')
  await pool.query('create index if not exists transactions_user_id_idx on transactions (user_id)')
  await pool.query('delete from user_sessions where expires_at < now()')
}

async function getState(userId) {
  const settingsResult = await pool.query('select data from user_settings where user_id = $1', [userId])
  const transactionsResult = await pool.query(`
    select
      id,
      transaction_date,
      description,
      category_id,
      amount,
      payment_mode,
      notes
    from transactions
    where user_id = $1
    order by transaction_date desc, created_at desc
  `, [userId])

  return {
    settings: settingsResult.rows[0]?.data ?? buildEmptyState().settings,
    transactions: transactionsResult.rows.map((row) => ({
      id: row.id,
      date: toDateString(row.transaction_date),
      description: row.description,
      categoryId: row.category_id,
      amount: Number(row.amount),
      paymentMode: row.payment_mode,
      notes: row.notes,
    })),
  }
}

async function saveSettings(userId, settings) {
  validateSettings(settings)
  await pool.query(
    `
      insert into user_settings (user_id, data, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (user_id)
      do update set data = excluded.data, updated_at = now()
    `,
    [userId, JSON.stringify(settings)],
  )
}

async function upsertTransaction(userId, transaction) {
  validateTransaction(transaction)
  await pool.query(
    `
      insert into transactions (
        id,
        user_id,
        transaction_date,
        description,
        category_id,
        amount,
        payment_mode,
        notes
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      on conflict (id)
      do update set
        transaction_date = excluded.transaction_date,
        description = excluded.description,
        category_id = excluded.category_id,
        amount = excluded.amount,
        payment_mode = excluded.payment_mode,
        notes = excluded.notes,
        updated_at = now()
      where transactions.user_id = excluded.user_id
    `,
    [
      transaction.id,
      userId,
      transaction.date,
      transaction.description.trim(),
      transaction.categoryId,
      Number(transaction.amount),
      transaction.paymentMode,
      transaction.notes ?? '',
    ],
  )
}

async function replaceState(userId, state) {
  validateState(state)
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query('delete from transactions where user_id = $1', [userId])
    await client.query(
      `
        insert into user_settings (user_id, data, updated_at)
        values ($1, $2::jsonb, now())
        on conflict (user_id)
        do update set data = excluded.data, updated_at = now()
      `,
      [userId, JSON.stringify(state.settings)],
    )
    for (const transaction of state.transactions) {
      validateTransaction(transaction)
      await client.query(
        `
          insert into transactions (
            id,
            user_id,
            transaction_date,
            description,
            category_id,
            amount,
            payment_mode,
            notes
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          transaction.id,
          userId,
          transaction.date,
          transaction.description.trim(),
          transaction.categoryId,
          Number(transaction.amount),
          transaction.paymentMode,
          transaction.notes ?? '',
        ],
      )
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

async function createUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email)
  validatePassword(password)
  const displayName = String(name ?? '').trim() || normalizedEmail.split('@')[0]
  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  try {
    const result = await pool.query(
      `
        insert into users (id, email, name, password_hash)
        values ($1, $2, $3, $4)
        returning id, email, name
      `,
      [userId, normalizedEmail, displayName, passwordHash],
    )
    await replaceState(userId, buildEmptyState())
    return result.rows[0]
  } catch (error) {
    if (error?.code === '23505') throw new Error('An account with this email already exists')
    throw error
  }
}

async function verifyLogin(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const result = await pool.query('select id, email, name, password_hash from users where email = $1', [normalizedEmail])
  const row = result.rows[0]
  if (!row) throw new Error('Invalid email or password')
  const verified = await verifyPassword(password, row.password_hash)
  if (!verified) throw new Error('Invalid email or password')
  return { id: row.id, email: row.email, name: row.name }
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url')
  await pool.query(
    `
      insert into user_sessions (token, user_id, expires_at)
      values ($1, $2, now() + interval '30 days')
    `,
    [token, userId],
  )
  return token
}

async function requireAuth(request, response, next) {
  try {
    const header = request.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return response.status(401).json({ error: 'Authentication required' })

    const result = await pool.query(
      `
        select users.id, users.email, users.name
        from user_sessions
        join users on users.id = user_sessions.user_id
        where user_sessions.token = $1
          and user_sessions.expires_at > now()
      `,
      [token],
    )
    const user = result.rows[0]
    if (!user) return response.status(401).json({ error: 'Session expired' })

    request.user = user
    request.token = token
    next()
  } catch (error) {
    next(error)
  }
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

async function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash ?? '').split(':')
  if (!salt || !hash) return false
  const derived = await scrypt(password, salt, 64)
  const stored = Buffer.from(hash, 'hex')
  return stored.length === derived.length && crypto.timingSafeEqual(stored, derived)
}

function validateState(state) {
  if (!state || typeof state !== 'object') throw new Error('Invalid state payload')
  validateSettings(state.settings)
  if (!Array.isArray(state.transactions)) throw new Error('Transactions must be an array')
  for (const transaction of state.transactions) validateTransaction(transaction)
}

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') throw new Error('Invalid settings payload')
  if (!Number.isFinite(Number(settings.startYear))) throw new Error('Start year is required')
  if (!Number.isFinite(Number(settings.salary))) throw new Error('Salary is required')
  if (!Number.isFinite(Number(settings.salaryGrowth))) throw new Error('Salary growth is required')
  if (!Number.isFinite(Number(settings.weeklyLimit))) throw new Error('Weekly limit is required')
  if (!Array.isArray(settings.categories) || settings.categories.length === 0) {
    throw new Error('At least one category is required')
  }
  if (!Array.isArray(settings.paymentModes) || settings.paymentModes.length === 0) {
    throw new Error('At least one payment mode is required')
  }
}

function normalizeEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('A valid email is required')
  return normalized
}

function validatePassword(password) {
  if (String(password ?? '').length < 8) throw new Error('Password must be at least 8 characters')
}

function validateTransaction(transaction) {
  if (!transaction || typeof transaction !== 'object') throw new Error('Invalid transaction payload')
  if (!isUuid(transaction.id)) throw new Error('Transaction id must be a UUID')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) throw new Error('Transaction date must be yyyy-mm-dd')
  if (!String(transaction.description ?? '').trim()) throw new Error('Description is required')
  if (!String(transaction.categoryId ?? '').trim()) throw new Error('Category is required')
  if (!Number.isFinite(Number(transaction.amount)) || Number(transaction.amount) < 0) {
    throw new Error('Amount must be a positive number')
  }
  if (!String(transaction.paymentMode ?? '').trim()) throw new Error('Payment mode is required')
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value))
}

function toDateString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}
