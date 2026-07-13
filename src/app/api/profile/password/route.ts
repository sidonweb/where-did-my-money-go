import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { changePassword } from '@/lib/server/store'

export const runtime = 'nodejs'

export function PUT(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    const { currentPassword, newPassword } = await request.json()
    await changePassword(user.id, currentPassword, newPassword)
    return NextResponse.json({ success: true })
  })
}
