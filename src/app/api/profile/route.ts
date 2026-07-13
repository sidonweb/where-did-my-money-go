import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { updateProfile } from '@/lib/server/store'

export const runtime = 'nodejs'

export function PUT(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    const input = await request.json()
    return NextResponse.json(await updateProfile(user.id, input))
  })
}
