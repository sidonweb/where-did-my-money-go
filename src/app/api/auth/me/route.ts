import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { getState } from '@/lib/server/store'

export const runtime = 'nodejs'

export function GET(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    return NextResponse.json({ user, state: await getState(user.id) })
  })
}
