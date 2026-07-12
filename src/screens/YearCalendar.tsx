import { format, getDay, getDaysInMonth } from 'date-fns'
import { useMemo } from 'react'
import { PanelHeader } from '../components/ui/PanelHeader'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { monthNames } from '../data/constants'
import type { Category, Transaction } from '../types'
import { formatMoney } from '../utils/format'
import { buildYearDailyTotals } from '../utils/models'

export function YearCalendar({
  categoryById,
  selectedYear,
  transactions,
}: {
  categoryById: Map<string, Category>
  selectedYear: number
  transactions: Transaction[]
}) {
  const daily = useMemo(() => buildYearDailyTotals(selectedYear, transactions, categoryById), [categoryById, selectedYear, transactions])
  const maxSpend = Math.max(...Array.from(daily.values()), 1)

  return (
    <Card><CardHeader><PanelHeader title="Yearly Calendar" action={`Last updated: ${format(new Date(), 'HH:mm')}`} /></CardHeader><CardContent>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {monthNames.map((month, monthIndex) => {
          const first = new Date(selectedYear, monthIndex, 1)
          const days = getDaysInMonth(first)
          const offset = (getDay(first) + 6) % 7
          return (
            <Card className="gap-0 bg-background/50 p-4 py-4 shadow-none" key={month}>
              <h3 className="mb-3 text-sm font-bold">{month}</h3>
              <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted-foreground">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: offset }).map((_, index) => (
                  <span key={`blank-${index}`} />
                ))}
                {Array.from({ length: days }).map((_, index) => {
                  const date = new Date(selectedYear, monthIndex, index + 1)
                  const key = format(date, 'yyyy-MM-dd')
                  const amount = daily.get(key) ?? 0
                  return (
                    <span
                      className="grid aspect-square place-items-center rounded-md text-[10px] font-semibold"
                      key={key}
                      title={`${format(date, 'dd MMM yyyy')} - ${formatMoney(amount)}`}
                      style={{ background: `color-mix(in srgb, var(--chart-2) ${7 + (amount / maxSpend) * 55}%, transparent)` }}
                    >
                      {index + 1}
                    </span>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </CardContent></Card>
  )
}
