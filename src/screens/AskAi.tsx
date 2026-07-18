import { Bot, LoaderCircle, Send, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import type { AiChatMessage, AiUsage } from '../types'
import { fetchAiUsage, streamAskAi } from '../services/api'
import { cn } from '../utils/cn'

const EXAMPLE_QUESTIONS = [
  'How much did I spend on Wants this cycle?',
  'Am I on track for my savings goal?',
  'Which category am I overspending in?',
  'How did this week compare with my weekly limit?',
]

type ChatEntry = AiChatMessage & {
  id: string
  isError?: boolean
}

export function AskAi() {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [question, setQuestion] = useState('')
  const [usage, setUsage] = useState<AiUsage | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [usageError, setUsageError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAiUsage()
      .then(setUsage)
      .catch(() => setUsageError('Usage unavailable'))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isStreaming, messages])

  const atLimit = Boolean(usage && usage.used >= usage.limit)

  async function ask(nextQuestion = question) {
    const trimmed = nextQuestion.trim()
    if (!trimmed || isStreaming || atLimit) return

    const history = messages
      .filter((message) => !message.isError && message.content)
      .slice(-6)
      .map(({ role, content }) => ({ role, content }))
    const userMessage: ChatEntry = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    const answerId = crypto.randomUUID()
    setMessages((current) => [...current, userMessage, { id: answerId, role: 'assistant', content: '' }])
    setQuestion('')
    setIsStreaming(true)

    try {
      await streamAskAi(
        { question: trimmed, history },
        {
          onUsage: setUsage,
          onDelta: (delta) => {
            setMessages((current) => current.map((message) => message.id === answerId ? { ...message, content: message.content + delta } : message))
          },
        },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't get an answer right now, try again"
      setMessages((current) => current.map((entry) => entry.id === answerId ? { ...entry, content: message, isError: true } : entry))
      void fetchAiUsage().then(setUsage).catch(() => undefined)
    } finally {
      setIsStreaming(false)
    }
  }

  function clearConversation() {
    if (isStreaming) return
    setMessages([])
    setQuestion('')
  }

  return (
    <Card className="mx-auto min-h-[min(720px,calc(100vh-12rem))] overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles size={18} /></div>
          <div className="min-w-0">
            <h2 className="font-bold">Ask about your money</h2>
            <p className="truncate text-xs text-muted-foreground">Answers are grounded in your WDMMG data</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {usage ? `${usage.used}/${usage.limit} questions used today` : usageError || 'Loading usage…'}
          </span>
          <Button aria-label="Clear conversation" disabled={messages.length === 0 || isStreaming} onClick={clearConversation} size="icon-sm" title="Clear conversation" type="button" variant="ghost">
            <Trash2 size={15} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col px-0">
        <div aria-live="polite" className="min-h-[360px] flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="grid min-h-[330px] place-items-center text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-muted"><Bot size={22} /></div>
                <h3 className="text-lg font-bold">What would you like to understand?</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Ask about spending, categories, budget cycles, savings, or weekly limits. Ask AI can only read your financial data through a small set of safe, read-only summaries.</p>
              </div>
            </div>
          ) : messages.map((message) => (
            <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')} key={message.id}>
              <div className={cn(
                'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[78%]',
                message.role === 'user' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-muted/45',
                message.isError && 'border-destructive/30 bg-destructive/5 text-destructive',
              )}>
                {message.role === 'assistant' && !message.content && isStreaming ? (
                  <span className="flex items-center gap-2 text-muted-foreground"><LoaderCircle className="animate-spin" size={15} /> Thinking about your data…</span>
                ) : <p className="whitespace-pre-wrap">{message.content}</p>}
                {message.role === 'assistant' && message.content && !message.isError && (
                  <p className="mt-3 border-t pt-2 text-[10px] leading-4 text-muted-foreground">Generated from your data — always verify important figures in the Ledger.</p>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t bg-card px-4 py-4 sm:px-6">
          {atLimit ? (
            <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5">
              <strong>{usage?.plan === 'pro' ? 'Pro' : 'Free'} daily limit reached.</strong>{' '}
              You get {usage?.limit} questions per day. Resets at {formatReset(usage!.resetAt)}.
              {usage?.plan === 'free' && ' Pro includes 12 questions per day.'}
            </div>
          ) : (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {EXAMPLE_QUESTIONS.map((example) => (
                <button className="shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50" disabled={isStreaming} key={example} onClick={() => void ask(example)} type="button">
                  {example}
                </button>
              ))}
            </div>
          )}
          <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); void ask() }}>
            <textarea
              aria-label="Ask a question about your finances"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isStreaming || atLimit}
              maxLength={1_000}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void ask()
                }
              }}
              placeholder={atLimit ? 'Daily limit reached' : 'Ask about your spending…'}
              rows={1}
              value={question}
            />
            <Button aria-label="Send question" disabled={!question.trim() || isStreaming || atLimit} size="icon-lg" type="submit">
              {isStreaming ? <LoaderCircle className="animate-spin" /> : <Send />}
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Ask AI uses UTC for daily resets. Conversation history stays only in this browser tab.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatReset(resetAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(resetAt))
}
