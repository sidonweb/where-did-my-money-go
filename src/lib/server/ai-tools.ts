import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns'
import type { BudgetType, Category } from '@/types'
import { buildBudgetCycles, buildMonthlyModel, buildWeeklyRows } from '@/utils/models'
import { pool } from './database'
import { getState } from './store'

export const FINANCE_TOOLS = [
  {
    type: 'function' as const,
    name: 'getCycleSummary',
    description: 'Get income, total spent, Need/Want/Saving totals, and financial score for a budget cycle. Omit cycleId for the current cycle. Calendar cycle IDs use YYYY-MM; salary cycle IDs use their YYYY-MM-DD start date.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        cycleId: { type: ['string', 'null'], description: 'Cycle ID, or null for the current cycle.' },
      },
      required: ['cycleId'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'getCategoryBreakdown',
    description: 'Get spending totals grouped by category for an inclusive date range. Income is excluded.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Inclusive start date in YYYY-MM-DD format.' },
        endDate: { type: 'string', description: 'Inclusive end date in YYYY-MM-DD format.' },
      },
      required: ['startDate', 'endDate'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'getTransactions',
    description: 'Get a capped list of at most 50 matching transactions. Use only when aggregate tools cannot answer the question.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          properties: {
            startDate: { type: ['string', 'null'], description: 'Inclusive YYYY-MM-DD start date, or null.' },
            endDate: { type: ['string', 'null'], description: 'Inclusive YYYY-MM-DD end date, or null.' },
            category: { type: ['string', 'null'], description: 'Exact category name or category ID, or null.' },
            type: { type: ['string', 'null'], enum: ['Need', 'Want', 'Saving', 'Income', null], description: 'Budget type, or null.' },
            search: { type: ['string', 'null'], description: 'Text to match in description or notes, or null.' },
            limit: { type: ['integer', 'null'], minimum: 1, maximum: 50, description: 'Maximum rows, or null for 20.' },
          },
          required: ['startDate', 'endDate', 'category', 'type', 'search', 'limit'],
          additionalProperties: false,
        },
      },
      required: ['filters'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'getWeeklyAnalysis',
    description: 'Get weekly spending versus the configured weekly limit for an inclusive date range. Income is excluded.',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Inclusive start date in YYYY-MM-DD format.' },
        endDate: { type: 'string', description: 'Inclusive end date in YYYY-MM-DD format.' },
      },
      required: ['startDate', 'endDate'],
      additionalProperties: false,
    },
  },
] as const

type ToolArguments = Record<string, unknown>
type TransactionRow = {
  id: string
  transaction_date: string
  description: string
  category_id: string
  amount: string | number
  payment_mode: string
  notes: string
  total_count: string | number
}

export async function executeFinanceTool(userId: string, name: string, args: ToolArguments) {
  switch (name) {
    case 'getCycleSummary':
      return getCycleSummary(userId, nullableString(args.cycleId))
    case 'getCategoryBreakdown':
      return getCategoryBreakdown(userId, requiredDate(args.startDate), requiredDate(args.endDate))
    case 'getTransactions':
      return getTransactions(userId, recordValue(args.filters))
    case 'getWeeklyAnalysis':
      return getWeeklyAnalysis(userId, requiredDate(args.startDate), requiredDate(args.endDate))
    default:
      throw new Error('Unsupported finance tool')
  }
}

async function getCycleSummary(userId: string, cycleId: string | null) {
  const state = await getState(userId)
  const categoryById = categoryMap(state.settings.categories)
  const today = format(new Date(), 'yyyy-MM-dd')
  let startDate: string
  let endDate: string
  let income: number | undefined
  let resolvedCycleId: string

  if (state.settings.budgetCycleType === 'salary') {
    const cycles = buildBudgetCycles(state.transactions, categoryById)
    const cycle = cycleId ? cycles.find((item) => item.id === cycleId) : cycles.filter((item) => item.startDate <= today).at(-1)
    if (!cycle) return { available: false, reason: 'No matching salary cycle. Add an Income transaction to create a salary cycle.' }
    startDate = cycle.startDate
    endDate = cycle.endDate ?? today
    income = cycle.income
    resolvedCycleId = cycle.id
  } else {
    const monthId = cycleId ?? format(new Date(), 'yyyy-MM')
    if (!/^\d{4}-\d{2}$/.test(monthId)) throw new Error('Calendar cycleId must use YYYY-MM')
    const monthStart = parseISO(`${monthId}-01`)
    if (Number.isNaN(monthStart.getTime())) throw new Error('Invalid calendar cycle')
    startDate = format(startOfMonth(monthStart), 'yyyy-MM-dd')
    endDate = format(endOfMonth(monthStart), 'yyyy-MM-dd')
    resolvedCycleId = monthId
  }

  const transactions = state.transactions.filter((item) => item.date >= startDate && item.date <= endDate)
  const model = buildMonthlyModel(transactions, state.settings, Number(startDate.slice(0, 4)), categoryById, income)
  return {
    available: true,
    cycleId: resolvedCycleId,
    startDate,
    endDate,
    income: roundMoney(model.salary),
    totalSpent: roundMoney(model.totalActual),
    totals: {
      Need: roundMoney(model.actualByType.Need),
      Want: roundMoney(model.actualByType.Want),
      Saving: roundMoney(model.actualByType.Saving),
    },
    score: model.score,
  }
}

async function getCategoryBreakdown(userId: string, startDate: string, endDate: string) {
  validateRange(startDate, endDate)
  const state = await getState(userId)
  const categories = categoryMap(state.settings.categories)
  const result = await pool.query<{ category_id: string; total: string | number; transaction_count: string | number }>(
    `
      select category_id, sum(amount) as total, count(*)::int as transaction_count
      from transactions
      where user_id = $1 and transaction_date between $2 and $3
      group by category_id
      order by total desc
    `,
    [userId, startDate, endDate],
  )
  return {
    startDate,
    endDate,
    categories: result.rows
      .map((row) => ({ category: categories.get(row.category_id), row }))
      .filter((item) => item.category?.type !== 'Income')
      .map(({ category, row }) => ({
        categoryId: row.category_id,
        categoryName: category?.name ?? 'Uncategorized',
        type: category?.type ?? 'Need',
        total: roundMoney(Number(row.total)),
        transactionCount: Number(row.transaction_count),
      })),
  }
}

async function getTransactions(userId: string, filters: ToolArguments) {
  const state = await getState(userId)
  const categories = categoryMap(state.settings.categories)
  const clauses = ['user_id = $1']
  const values: unknown[] = [userId]
  const startDate = optionalDate(filters.startDate)
  const endDate = optionalDate(filters.endDate)
  if (startDate) addClause(clauses, values, 'transaction_date >=', startDate)
  if (endDate) addClause(clauses, values, 'transaction_date <=', endDate)
  if (startDate && endDate) validateRange(startDate, endDate)

  const categoryFilter = nullableString(filters.category)
  if (categoryFilter) {
    const category = state.settings.categories.find((item) => item.id === categoryFilter || item.name.toLowerCase() === categoryFilter.toLowerCase())
    addClause(clauses, values, 'category_id =', category?.id ?? categoryFilter)
  }

  const typeFilter = nullableString(filters.type) as BudgetType | null
  if (typeFilter) {
    if (!['Need', 'Want', 'Saving', 'Income'].includes(typeFilter)) throw new Error('Invalid transaction type')
    const categoryIds = state.settings.categories.filter((item) => item.type === typeFilter).map((item) => item.id)
    values.push(categoryIds)
    clauses.push(`category_id = any($${values.length}::text[])`)
  }

  const search = nullableString(filters.search)?.slice(0, 100)
  if (search) {
    values.push(`%${search}%`)
    clauses.push(`(description ilike $${values.length} or notes ilike $${values.length})`)
  }

  const requestedLimit = filters.limit == null ? 20 : Number(filters.limit)
  const limit = Math.max(1, Math.min(50, Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : 20))
  values.push(limit)
  const result = await pool.query<TransactionRow>(
    `
      select id, transaction_date::text, description, category_id, amount, payment_mode, notes,
             count(*) over() as total_count
      from transactions
      where ${clauses.join(' and ')}
      order by transaction_date desc, created_at desc
      limit $${values.length}
    `,
    values,
  )
  const totalMatches = Number(result.rows[0]?.total_count ?? 0)
  return {
    returned: result.rows.length,
    totalMatches,
    truncated: totalMatches > result.rows.length,
    transactions: result.rows.map((row) => ({
      id: row.id,
      date: row.transaction_date.slice(0, 10),
      description: row.description,
      categoryName: categories.get(row.category_id)?.name ?? 'Uncategorized',
      type: categories.get(row.category_id)?.type ?? 'Need',
      amount: roundMoney(Number(row.amount)),
      paymentMode: row.payment_mode,
      notes: row.notes,
    })),
  }
}

async function getWeeklyAnalysis(userId: string, startDate: string, endDate: string) {
  validateRange(startDate, endDate)
  const state = await getState(userId)
  const categories = categoryMap(state.settings.categories)
  const transactions = state.transactions.filter((item) => {
    const type = categories.get(item.categoryId)?.type
    return item.date >= startDate && item.date <= endDate && type !== 'Income'
  })
  const weeks = buildWeeklyRows(parseISO(startDate), parseISO(endDate), transactions, state.settings.weeklyLimit)
  return {
    startDate,
    endDate,
    weeklyLimit: roundMoney(state.settings.weeklyLimit),
    weeks: weeks.map((week) => ({
      label: week.label,
      spend: roundMoney(week.spend),
      limit: roundMoney(week.limit),
      difference: roundMoney(week.limit - week.spend),
      overLimit: week.spend > week.limit,
    })),
  }
}

function addClause(clauses: string[], values: unknown[], expression: string, value: unknown) {
  values.push(value)
  clauses.push(`${expression} $${values.length}`)
}

function validateRange(startDate: string, endDate: string) {
  if (startDate > endDate) throw new Error('startDate must be on or before endDate')
  const days = Math.round((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / 86_400_000)
  if (days > 370) throw new Error('Date range cannot exceed 370 days')
}

function requiredDate(value: unknown) {
  const date = String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parseISO(date).getTime())) throw new Error('Date must use YYYY-MM-DD')
  return date
}

function optionalDate(value: unknown) {
  const date = nullableString(value)
  return date ? requiredDate(date) : null
}

function nullableString(value: unknown) {
  return value == null ? null : String(value).trim() || null
}

function recordValue(value: unknown): ToolArguments {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid tool filters')
  return value as ToolArguments
}

function categoryMap(categories: Category[]) {
  return new Map(categories.map((category) => [category.id, category]))
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}
