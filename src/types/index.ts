export type BudgetType = 'Need' | 'Want' | 'Saving' | 'Income'
export type SpendingBudgetType = Exclude<BudgetType, 'Income'>

export type BudgetCycleType = 'calendar' | 'salary'

export type Category = {
  id: string
  name: string
  type: BudgetType
  color: string
}

export type Transaction = {
  id: string
  date: string
  description: string
  categoryId: string
  amount: number
  paymentMode: string
  notes: string
}

export type SettingsState = {
  startYear: number
  salary: number
  salaryGrowth: number
  weeklyLimit: number
  budgetCycleType: BudgetCycleType
  shakeToOpenLedger: boolean
  categories: Category[]
  paymentModes: string[]
}

export type BudgetCycle = {
  id: string
  startDate: string
  endDate: string | null
  income: number
}

export type AppState = {
  settings: SettingsState
  transactions: Transaction[]
}

export type User = {
  id: string
  email: string
  name: string
}

export type Tab = 'dashboard' | 'ledger' | 'analysis' | 'calendar' | 'profile'

export type ApiStatus = 'loading' | 'online' | 'offline' | 'saving'
