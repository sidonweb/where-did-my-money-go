export type BudgetType = 'Need' | 'Want' | 'Saving'

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
  categories: Category[]
  paymentModes: string[]
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

export type Tab = 'dashboard' | 'ledger' | 'analysis' | 'calendar' | 'guide' | 'setup'

export type ApiStatus = 'loading' | 'online' | 'offline' | 'saving'
