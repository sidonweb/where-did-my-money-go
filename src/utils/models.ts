import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isAfter,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { budgetTypes } from '../data/constants'
import type { BudgetType, Category, SettingsState, Transaction } from '../types'

export function buildSalaryPlans(settings: SettingsState) {
  return Array.from({ length: 5 }, (_, index) => {
    const salary = Math.round(settings.salary * (1 + settings.salaryGrowth / 100) ** index)
    return {
      year: settings.startYear + index,
      salary,
      need: Math.floor(salary * 0.5),
      want: Math.floor(salary * 0.3),
      saving: Math.ceil(salary * 0.2),
    }
  })
}

export function buildMonthlyModel(
  transactions: Transaction[],
  settings: SettingsState,
  selectedYear: number,
  categoryById: Map<string, Category>,
) {
  const plan = buildSalaryPlans(settings).find((item) => item.year === selectedYear) ?? buildSalaryPlans(settings)[0]
  const budgetByType: Record<BudgetType, number> = {
    Need: plan.need,
    Want: plan.want,
    Saving: plan.saving,
  }
  const actualByType: Record<BudgetType, number> = { Need: 0, Want: 0, Saving: 0 }
  const actualByCategory = new Map<string, number>()

  for (const transaction of transactions) {
    const category = categoryById.get(transaction.categoryId)
    if (!category) continue
    actualByType[category.type] += transaction.amount
    actualByCategory.set(category.id, (actualByCategory.get(category.id) ?? 0) + transaction.amount)
  }

  const typeRows = budgetTypes.map((type) => ({
    type,
    budget: budgetByType[type],
    actual: actualByType[type],
    difference: budgetByType[type] - actualByType[type],
  }))
  const categoryRows = Array.from(actualByCategory.entries())
    .map(([categoryId, actual]) => ({
      categoryId,
      name: categoryById.get(categoryId)?.name ?? 'Uncategorized',
      type: categoryById.get(categoryId)?.type ?? 'Need',
      actual,
    }))
    .sort((a, b) => b.actual - a.actual)

  const totalActual = typeRows.reduce((sum, row) => sum + row.actual, 0)
  const amountLeft = plan.salary - totalActual
  const percentageLeft = plan.salary > 0 ? (amountLeft / plan.salary) * 100 : 0
  const totalBudget = plan.need + plan.want + plan.saving
  const spendRatio = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0
  const overBudgetPenalty = typeRows.reduce((sum, row) => sum + Math.max(row.actual - row.budget, 0) / Math.max(row.budget, 1), 0)
  const savingsPenalty = actualByType.Saving < plan.saving ? (plan.saving - actualByType.Saving) / Math.max(plan.saving, 1) : 0
  const score = Math.max(0, Math.min(10, Math.round((10 - (overBudgetPenalty + savingsPenalty * 0.5) * 4) * 10) / 10))

  return { actualByType, amountLeft, categoryRows, percentageLeft, score, spendRatio, totalActual, typeRows }
}

export function buildDailyTrend(monthStart: Date, transactions: Transaction[], categoryById: Map<string, Category>) {
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) })
  return days.map((day) => {
    const spend = transactions
      .filter((transaction) => isSameDay(parseISO(transaction.date), day))
      .filter((transaction) => categoryById.get(transaction.categoryId)?.type !== 'Saving')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    return { date: format(day, 'yyyy-MM-dd'), day: getDate(day), spend }
  })
}

export function buildWeeklyRows(start: Date, end: Date, transactions: Transaction[], weeklyLimit: number) {
  const rows = []
  let cursor = startOfWeek(start, { weekStartsOn: 1 })
  while (!isAfter(cursor, end)) {
    const weekStart = cursor
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 })
    const spend = transactions
      .filter((transaction) => {
        const date = parseISO(transaction.date)
        return isWithinInterval(date, { start: weekStart, end: weekEnd })
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    rows.push({
      label: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM')}`,
      spend,
      limit: weeklyLimit,
      ratio: weeklyLimit > 0 ? (spend / weeklyLimit) * 100 : 0,
    })
    cursor = addDays(cursor, 7)
  }
  return rows
}

export function buildPaymentRows(transactions: Transaction[]) {
  const map = new Map<string, number>()
  for (const transaction of transactions) {
    map.set(transaction.paymentMode, (map.get(transaction.paymentMode) ?? 0) + transaction.amount)
  }
  return Array.from(map.entries())
    .map(([mode, amount]) => ({ mode, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function buildYearDailyTotals(year: number, transactions: Transaction[], categoryById: Map<string, Category>) {
  const map = new Map<string, number>()
  for (const transaction of transactions) {
    const date = parseISO(transaction.date)
    if (date.getFullYear() !== year) continue
    if (categoryById.get(transaction.categoryId)?.type === 'Saving') continue
    map.set(transaction.date, (map.get(transaction.date) ?? 0) + transaction.amount)
  }
  return map
}

export function typeColor(type: BudgetType) {
  return type === 'Need' ? '#14532d' : type === 'Want' ? '#f59e0b' : '#0891b2'
}
