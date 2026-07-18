import { NextResponse, type NextRequest } from 'next/server'
import type { AiChatMessage } from '@/types'
import { ApiError, handleApi, requireAuth } from '@/lib/server/api'
import { runAskAi } from '@/lib/server/ask-ai'
import { buildLimitMessage, getAiUsage, reserveAiRequest } from '@/lib/server/ai-usage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET(request: NextRequest) {
  return handleApi(async () => {
    const { user } = await requireAuth(request)
    return NextResponse.json(await getAiUsage(user.id, user.plan))
  })
}

export function POST(request: NextRequest) {
  return handleApi(async () => {
    const [{ user }, body] = await Promise.all([requireAuth(request), readBody(request)])
    const currentUsage = await getAiUsage(user.id, user.plan)
    if (currentUsage.used >= currentUsage.limit) throw new ApiError(buildLimitMessage(currentUsage), 429)
    const usage = await reserveAiRequest(user.id, user.plan)
    if (!usage) throw new ApiError(buildLimitMessage(await getAiUsage(user.id, user.plan)), 429)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        send('usage', usage)
        try {
          await runAskAi(user.id, body, (delta) => {
            if (!request.signal.aborted) send('delta', { delta })
          })
          if (!request.signal.aborted) send('done', { success: true })
        } catch (error) {
          console.error('Ask AI request failed', { userId: user.id, error })
          if (!request.signal.aborted) send('error', { message: "Couldn't get an answer right now, try again" })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  })
}

async function readBody(request: NextRequest): Promise<{ question: string; history: AiChatMessage[] }> {
  const body = await request.json().catch(() => null) as { question?: unknown; history?: unknown } | null
  const question = String(body?.question ?? '').trim()
  if (!question) throw new ApiError('Enter a question', 400)
  if (question.length > 1_000) throw new ApiError('Question must be 1,000 characters or fewer', 400)
  const history = Array.isArray(body?.history) ? body.history : []
  return { question, history: history as AiChatMessage[] }
}
