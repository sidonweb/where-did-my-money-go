import { NextResponse } from 'next/server'
import { handleApi } from '@/lib/server/api'
import { pool } from '@/lib/server/database'

export const runtime = 'nodejs'

export function GET() {
  return handleApi(async () => {
    await pool.query('select 1')
    return NextResponse.json({ ok: true })
  })
}
