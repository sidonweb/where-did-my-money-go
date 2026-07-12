import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { getState, saveSettings } from '@/lib/server/store'

export const runtime = 'nodejs'

export function PUT(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    await saveSettings(user.id, await request.json())
    return NextResponse.json(await getState(user.id))
  })
}
