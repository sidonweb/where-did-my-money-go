import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { getState, upsertTransaction } from '@/lib/server/store'

export const runtime = 'nodejs'

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    await upsertTransaction(user.id, await request.json())
    return NextResponse.json(await getState(user.id), { status: 201 })
  })
}
