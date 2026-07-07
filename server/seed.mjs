const defaultCategories = [
  { id: 'life-infra', name: 'Life Infrastructure', type: 'Need', color: '#2563eb' },
  { id: 'future-me', name: 'Future Me', type: 'Saving', color: '#059669' },
  { id: 'performance-growth', name: 'Performance & Growth', type: 'Need', color: '#7c3aed' },
  { id: 'relationships', name: 'Relationships & Generosity', type: 'Want', color: '#e11d48' },
  { id: 'lifestyle', name: 'Lifestyle Enjoyment', type: 'Want', color: '#f59e0b' },
]

export function buildEmptyState() {
  return {
    settings: {
      startYear: new Date().getFullYear(),
      salary: 0,
      salaryGrowth: 10,
      weeklyLimit: 0,
      categories: defaultCategories,
      paymentModes: ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Bank Transfer'],
    },
    transactions: [],
  }
}
