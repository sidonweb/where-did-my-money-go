import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { buildEmptyState } from '@/lib/server/default-state'
import { getState, replaceState } from '@/lib/server/store'

export const runtime = 'nodejs'

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    await replaceState(user.id, buildEmptyState())
    return NextResponse.json(await getState(user.id))
  })
}
