import type { AppState } from '@/types'
import { defaultIncomeCategory } from '@/utils/settings'

const defaultCategories = [
  { id: 'life-infra', name: 'Life Infrastructure', type: 'Need' as const, color: '#2563eb' },
  { id: 'future-me', name: 'Future Me', type: 'Saving' as const, color: '#059669' },
  { id: 'performance-growth', name: 'Performance & Growth', type: 'Need' as const, color: '#7c3aed' },
  { id: 'relationships', name: 'Relationships & Generosity', type: 'Want' as const, color: '#e11d48' },
  { id: 'lifestyle', name: 'Lifestyle Enjoyment', type: 'Want' as const, color: '#f59e0b' },
  defaultIncomeCategory,
]

export function buildEmptyState(): AppState {
  return {
    settings: {
      startYear: new Date().getFullYear(),
      salary: 0,
      salaryGrowth: 10,
      weeklyLimit: 0,
      budgetCycleType: 'calendar',
      categories: defaultCategories,
      paymentModes: ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Bank Transfer'],
    },
    transactions: [],
  }
}
