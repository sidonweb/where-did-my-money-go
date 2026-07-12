import { NextResponse, type NextRequest } from 'next/server'
import { handleApi } from '@/lib/server/api'
import { createSession, createUser, getState } from '@/lib/server/store'

export const runtime = 'nodejs'

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const { email, password, name } = await request.json()
    const user = await createUser({ email, password, name })
    const token = await createSession(user.id)
    return NextResponse.json({ token, user, state: await getState(user.id) }, { status: 201 })
  })
}
