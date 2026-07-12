import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { deleteSession } from '@/lib/server/store'

export const runtime = 'nodejs'

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const { token } = await requireAuth(request)
    await deleteSession(token)
    return NextResponse.json({ ok: true })
  })
}
