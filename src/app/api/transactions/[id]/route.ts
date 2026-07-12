import { NextResponse, type NextRequest } from 'next/server'
import { handleApi, requireAuth } from '@/lib/server/api'
import { deleteTransaction, getState, upsertTransaction } from '@/lib/server/store'

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ id: string }> }

export function PUT(request: NextRequest, context: RouteContext) {
  return handleApi(async () => {
    const [{ user }, body, { id }] = await Promise.all([requireAuth(request), request.json(), context.params])
    await upsertTransaction(user.id, { ...body, id })
    return NextResponse.json(await getState(user.id))
  })
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return handleApi(async () => {
    const [{ user }, { id }] = await Promise.all([requireAuth(request), context.params])
    await deleteTransaction(user.id, id)
    return NextResponse.json(await getState(user.id))
  })
}
