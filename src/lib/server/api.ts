import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { User } from '@/types'
import { ensureDatabase, pool } from './database'

export class ApiError extends Error {
  constructor(message: string, public status = 500) {
    super(message)
  }
}

export async function handleApi(action: () => Promise<Response>) {
  try {
    await ensureDatabase()
    return await action()
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: error instanceof ApiError ? error.status : 500 },
    )
  }
}

export async function requireAuth(request: NextRequest): Promise<{ token: string; user: User }> {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new ApiError('Authentication required', 401)

  const result = await pool.query<User>(
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
  if (!user) throw new ApiError('Session expired', 401)
  return { token, user }
}
