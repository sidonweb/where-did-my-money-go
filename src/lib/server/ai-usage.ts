import type { AiUsage, User } from '@/types'
import { pool } from './database'

export const PLAN_LIMITS: Record<User['plan'], number> = {
  free: 3,
  pro: 12,
}

type UsageRow = {
  request_count: number
  usage_date: string
}

export async function getAiUsage(userId: string, plan: User['plan']): Promise<AiUsage> {
  const result = await pool.query<UsageRow>(
    `
      select
        coalesce(ai_daily_usage.request_count, 0)::int as request_count,
        (now() at time zone 'UTC')::date::text as usage_date
      from (select 1) as singleton
      left join ai_daily_usage
        on ai_daily_usage.user_id = $1
       and ai_daily_usage.usage_date = (now() at time zone 'UTC')::date
    `,
    [userId],
  )
  const row = result.rows[0]
  return toUsage(plan, row.request_count, row.usage_date)
}

export async function reserveAiRequest(userId: string, plan: User['plan']): Promise<AiUsage | null> {
  const limit = PLAN_LIMITS[plan]
  const result = await pool.query<UsageRow>(
    `
      insert into ai_daily_usage (user_id, usage_date, request_count, updated_at)
      values ($1, (now() at time zone 'UTC')::date, 1, now())
      on conflict (user_id, usage_date)
      do update set
        request_count = ai_daily_usage.request_count + 1,
        updated_at = now()
      where ai_daily_usage.request_count < $2
      returning request_count::int, usage_date::text
    `,
    [userId, limit],
  )

  const row = result.rows[0]
  return row ? toUsage(plan, row.request_count, row.usage_date) : null
}

export function buildLimitMessage(usage: AiUsage) {
  const planName = usage.plan === 'pro' ? 'Pro' : 'Free'
  const reset = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(usage.resetAt))
  const upgradeNote = usage.plan === 'free' ? ' Pro includes 12 questions per day.' : ''
  return `${planName} includes ${usage.limit} Ask AI questions per day. Your limit resets ${reset}.${upgradeNote}`
}

function toUsage(plan: User['plan'], used: number, usageDate: string): AiUsage {
  const resetAt = new Date(`${usageDate}T00:00:00.000Z`)
  resetAt.setUTCDate(resetAt.getUTCDate() + 1)
  return {
    plan,
    used,
    limit: PLAN_LIMITS[plan],
    resetAt: resetAt.toISOString(),
    timezone: 'UTC',
  }
}
