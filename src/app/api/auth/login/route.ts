import { NextResponse, type NextRequest } from 'next/server'
import { handleApi } from '@/lib/server/api'
import { createSession, getState, verifyLogin } from '@/lib/server/store'

export const runtime = 'nodejs'

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const { email, password } = await request.json()
    const user = await verifyLogin(email, password)
    const token = await createSession(user.id)
    return NextResponse.json({ token, user, state: await getState(user.id) })
  })
}
