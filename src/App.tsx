import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  format,
  getDate,
  getDay,
  getDaysInMonth,
  getQuarter,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
} from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Edit3,
  Filter,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  WalletCards,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent, FormEvent, ReactNode } from 'react'
import './App.css'

type BudgetType = 'Need' | 'Want' | 'Saving'

type Category = {
  id: string
  name: string
  type: BudgetType
  color: string
}

type Transaction = {
  id: string
  date: string
  description: string
  categoryId: string
  amount: number
  paymentMode: string
  notes: string
}

type SettingsState = {
  startYear: number
  salary: number
  salaryGrowth: number
  weeklyLimit: number
  categories: Category[]
  paymentModes: string[]
}

type AppState = {
  settings: SettingsState
  transactions: Transaction[]
}

type User = {
  id: string
  email: string
  name: string
}

type Tab = 'dashboard' | 'ledger' | 'analysis' | 'calendar' | 'setup'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const budgetTypes: BudgetType[] = ['Need', 'Want', 'Saving']
const appName = 'where did my money go?'
const authTokenKey = 'where-did-my-money-go-auth-token'
const today = new Date()

const defaultCategories: Category[] = [
  { id: 'life-infra', name: 'Life Infrastructure', type: 'Need', color: '#2563eb' },
  { id: 'future-me', name: 'Future Me', type: 'Saving', color: '#059669' },
  { id: 'performance-growth', name: 'Performance & Growth', type: 'Need', color: '#7c3aed' },
  { id: 'relationships', name: 'Relationships & Generosity', type: 'Want', color: '#e11d48' },
  { id: 'lifestyle', name: 'Lifestyle Enjoyment', type: 'Want', color: '#f59e0b' },
]

const initialState: AppState = {
  settings: {
    startYear: today.getFullYear(),
    salary: 0,
    salaryGrowth: 10,
    weeklyLimit: 0,
    categories: defaultCategories,
    paymentModes: ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Bank Transfer'],
  },
  transactions: [
    tx('2026-01-01', 'Uber late night - NYE', 'life-infra', 450, 'UPI', 'NYE cab home'),
    tx('2026-01-01', 'Brunch out with friends', 'lifestyle', 950, 'Credit Card', 'New year brunch'),
    tx('2026-01-01', 'Swiggy dinner', 'lifestyle', 380, 'UPI', 'Too tired to cook'),
    tx('2026-01-02', 'House Rent', 'life-infra', 12000, 'Bank Transfer', 'Monthly rent'),
    tx('2026-01-02', 'Groceries - BigBasket', 'life-infra', 1600, 'UPI', 'Monthly stock'),
    tx('2026-01-02', 'Swiggy lunch', 'lifestyle', 320, 'UPI', 'Office lunch'),
    tx('2026-01-03', 'Myntra sale - clothes', 'lifestyle', 3200, 'Credit Card', 'Sale haul'),
    tx('2026-01-03', 'Movie + popcorn', 'lifestyle', 800, 'UPI', 'Weekend movie'),
    tx('2026-01-05', 'Gym renewal', 'performance-growth', 1500, 'Credit Card', 'Quarterly plan'),
    tx('2026-01-08', 'SIP transfer', 'future-me', 10000, 'Bank Transfer', 'Monthly investing'),
    tx('2026-02-02', 'House Rent', 'life-infra', 12000, 'Bank Transfer', 'Monthly rent'),
    tx('2026-02-04', 'Groceries', 'life-infra', 2100, 'UPI', 'Monthly stock'),
    tx('2026-02-07', 'Concert tickets', 'lifestyle', 2600, 'Credit Card', 'Saturday plan'),
    tx('2026-02-11', 'Course subscription', 'performance-growth', 899, 'Debit Card', 'Learning'),
    tx('2026-02-14', 'Gift hamper', 'relationships', 1400, 'UPI', 'Birthday'),
    tx('2026-02-16', 'SIP transfer', 'future-me', 10000, 'Bank Transfer', 'Monthly investing'),
    tx('2026-03-02', 'House Rent', 'life-infra', 12000, 'Bank Transfer', 'Monthly rent'),
    tx('2026-03-06', 'Medical checkup', 'life-infra', 1800, 'Debit Card', 'Annual tests'),
    tx('2026-03-09', 'Weekend trip', 'lifestyle', 7200, 'Credit Card', 'Short break'),
    tx('2026-03-18', 'Books', 'performance-growth', 950, 'UPI', 'Career reading'),
    tx('2026-03-20', 'Family dinner', 'relationships', 2500, 'Credit Card', 'Treat'),
    tx('2026-03-25', 'SIP transfer', 'future-me', 10000, 'Bank Transfer', 'Monthly investing'),
    tx('2026-04-01', 'House Rent', 'life-infra', 12000, 'Bank Transfer', 'Monthly rent'),
    tx('2026-04-01', 'Groceries', 'life-infra', 1600, 'UPI', 'Monthly stock'),
    tx('2026-04-01', 'April SIP', 'future-me', 10000, 'Bank Transfer', 'Monthly investing'),
    tx('2026-04-02', 'Cab to airport', 'life-infra', 1079, 'UPI', 'Early flight'),
    tx('2026-04-03', 'Dinner out', 'lifestyle', 2180, 'Credit Card', 'Friends'),
    tx('2026-04-04', 'House supplies', 'life-infra', 1580, 'UPI', 'Cleaning supplies'),
    tx('2026-04-05', 'Streaming subscriptions', 'lifestyle', 768, 'Credit Card', 'Monthly'),
    tx('2026-04-06', 'Groceries top-up', 'life-infra', 1580, 'UPI', 'Vegetables and staples'),
    tx('2026-04-07', 'Online workshop', 'performance-growth', 1260, 'Debit Card', 'Skill building'),
    tx('2026-04-08', 'Birthday gift', 'relationships', 1329, 'UPI', 'Friend'),
    tx('2026-04-09', 'Coffee meetings', 'lifestyle', 420, 'UPI', 'Work catchups'),
    tx('2026-04-10', 'Doctor consultation', 'life-infra', 1000, 'Debit Card', 'Routine'),
    tx('2026-04-11', 'Weekend food crawl', 'lifestyle', 2330, 'Credit Card', 'Saturday'),
    tx('2026-04-12', 'Metro recharge', 'life-infra', 930, 'UPI', 'Commute'),
  ],
}

function tx(date: string, description: string, categoryId: string, amount: number, paymentMode: string, notes: string): Transaction {
  return {
    id: createId(),
    date,
    description,
    categoryId,
    amount,
    paymentMode,
    notes,
  }
}

const emptyDraft = {
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  categoryId: defaultCategories[0].id,
  amount: '',
  paymentMode: 'UPI',
  notes: '',
}

function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(authTokenKey) ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline' | 'saving'>('loading')
  const [apiMessage, setApiMessage] = useState('Connecting to PostgreSQL')

  useEffect(() => {
    if (!authToken) {
      setAuthChecked(true)
      setApiStatus('offline')
      setApiMessage('Sign in to sync')
      return
    }

    let cancelled = false
    fetchSession(authToken)
      .then((payload) => {
        if (cancelled) return
        setUser(payload.user)
        setState(payload.state)
        setApiStatus('online')
        setApiMessage('Saved')
        setAuthChecked(true)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        localStorage.removeItem(authTokenKey)
        setAuthToken('')
        setUser(null)
        setApiStatus('offline')
        setApiMessage(error instanceof Error ? error.message : 'API unavailable')
        setAuthChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  const categoryById = useMemo(() => new Map(state.settings.categories.map((category) => [category.id, category])), [state.settings.categories])
  const years = useMemo(() => Array.from({ length: 5 }, (_, index) => state.settings.startYear + index), [state.settings.startYear])
  const selectedMonthStart = useMemo(() => new Date(selectedYear, selectedMonth, 1), [selectedYear, selectedMonth])
  const selectedMonthEnd = useMemo(() => endOfMonth(selectedMonthStart), [selectedMonthStart])
  const monthlyTransactions = useMemo(
    () =>
      state.transactions.filter((transaction) => {
        const date = parseISO(transaction.date)
        return isWithinInterval(date, { start: selectedMonthStart, end: selectedMonthEnd })
      }),
    [selectedMonthEnd, selectedMonthStart, state.transactions],
  )
  const monthly = useMemo(
    () => buildMonthlyModel(monthlyTransactions, state.settings, selectedYear, categoryById),
    [categoryById, monthlyTransactions, selectedYear, state.settings],
  )
  const dailyTrend = useMemo(
    () => buildDailyTrend(selectedMonthStart, monthlyTransactions, categoryById),
    [categoryById, monthlyTransactions, selectedMonthStart],
  )
  const salaryPlans = useMemo(() => buildSalaryPlans(state.settings), [state.settings])

  async function updateSettings(patch: Partial<SettingsState>) {
    const nextSettings = { ...state.settings, ...patch }
    setState((current) => ({ ...current, settings: nextSettings }))
    await persist(() => saveSettings(nextSettings))
  }

  async function upsertTransaction(input: Transaction) {
    const optimistic = (current: AppState): AppState => {
      const exists = current.transactions.some((transaction) => transaction.id === input.id)
      return {
        ...current,
        transactions: exists
          ? current.transactions.map((transaction) => (transaction.id === input.id ? input : transaction))
          : [input, ...current.transactions],
      }
    }
    setState(optimistic)
    await persist(() => saveTransaction(input))
  }

  async function deleteTransaction(id: string) {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== id),
    }))
    await persist(() => removeTransaction(id))
  }

  async function resetDemo() {
    await persist(resetState)
    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  function importJson(file: File) {
    file.text().then(async (text) => {
      const parsed = JSON.parse(text) as AppState
      if (!parsed.settings || !Array.isArray(parsed.transactions)) {
        throw new Error('Invalid where did my money go? export')
      }
      await persist(() => importState(parsed))
    })
  }

  function exportJson() {
    downloadFile(`where-did-my-money-go-${format(new Date(), 'yyyy-MM-dd')}.json`, JSON.stringify(state, null, 2), 'application/json')
  }

  function exportCsv() {
    const rows = [
      ['Date', 'Description', 'Category', 'Amount', 'Payment Mode', 'Type', 'Notes'],
      ...state.transactions
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((transaction) => {
          const category = categoryById.get(transaction.categoryId)
          return [
            transaction.date,
            transaction.description,
            category?.name ?? 'Uncategorized',
            transaction.amount.toFixed(2),
            transaction.paymentMode,
            category?.type ?? '',
            transaction.notes,
          ]
        }),
    ]
    downloadFile(
      `daily-expense-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      rows.map((row) => row.map(escapeCsv).join(',')).join('\n'),
      'text/csv',
    )
  }

  async function persist(action: () => Promise<AppState>) {
    setApiStatus('saving')
    setApiMessage('Saving')
    try {
      const serverState = await action()
      setState(serverState)
      setApiStatus('online')
      setApiMessage('Saved')
    } catch (error) {
      setApiStatus('offline')
      setApiMessage(error instanceof Error ? error.message : 'Database sync failed')
    }
  }

  async function handleAuth(input: { email: string; name?: string; password: string; mode: 'login' | 'signup' }) {
    setApiStatus('saving')
    setApiMessage(input.mode === 'signup' ? 'Creating account' : 'Signing in')
    try {
      const payload = await authenticate(input)
      localStorage.setItem(authTokenKey, payload.token)
      setAuthToken(payload.token)
      setUser(payload.user)
      setState(payload.state)
      setApiStatus('online')
      setApiMessage('Saved')
    } catch (error) {
      setApiStatus('offline')
      setApiMessage(error instanceof Error ? error.message : 'Authentication failed')
      throw error
    }
  }

  async function handleLogout() {
    await logout().catch(() => undefined)
    localStorage.removeItem(authTokenKey)
    setAuthToken('')
    setUser(null)
    setState(initialState)
    setApiStatus('offline')
    setApiMessage('Signed out')
  }

  if (!authChecked) {
    return <LaunchScreen message="Opening your money workspace" />
  }

  if (!authToken || !user) {
    return <LandingAuth message={apiMessage} onAuth={handleAuth} />
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <IndianRupee size={22} />
          </div>
          <div>
            <strong>{appName}</strong>
            <span>50 / 30 / 20</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <NavButton icon={<LayoutDashboard size={18} />} label="Dashboard" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
          <NavButton icon={<WalletCards size={18} />} label="Ledger" active={tab === 'ledger'} onClick={() => setTab('ledger')} />
          <NavButton icon={<Filter size={18} />} label="Analysis" active={tab === 'analysis'} onClick={() => setTab('analysis')} />
          <NavButton icon={<CalendarDays size={18} />} label="Calendar" active={tab === 'calendar'} onClick={() => setTab('calendar')} />
          <NavButton icon={<Settings size={18} />} label="Setup" active={tab === 'setup'} onClick={() => setTab('setup')} />
        </nav>

        <div className="sidebar-actions">
          <div className={clsx('sync-pill', apiStatus)}>
            <span />
            {apiMessage}
          </div>
          <button className="icon-text-button" type="button" onClick={exportJson}>
            <Download size={16} /> Backup
          </button>
          <button className="icon-text-button quiet" type="button" onClick={resetDemo}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="icon-text-button quiet" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{monthNames[selectedMonth]} {selectedYear}</p>
            <h1>{getTabTitle(tab)}</h1>
            <p className="user-line">{user.name} · {user.email}</p>
          </div>
          <div className="topbar-controls">
            <Select value={selectedMonth} onChange={(value) => setSelectedMonth(Number(value))} label="Month">
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </Select>
            <Select value={selectedYear} onChange={(value) => setSelectedYear(Number(value))} label="Year">
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
        </header>

        {tab === 'dashboard' && (
          <Dashboard
            monthly={monthly}
            dailyTrend={dailyTrend}
            categoryById={categoryById}
            salaryPlans={salaryPlans}
            selectedYear={selectedYear}
            transactions={monthlyTransactions}
          />
        )}
        {tab === 'ledger' && (
          <Ledger
            categoryById={categoryById}
            settings={state.settings}
            transactions={state.transactions}
            onUpsert={upsertTransaction}
            onDelete={deleteTransaction}
            onExportCsv={exportCsv}
          />
        )}
        {tab === 'analysis' && (
          <Analysis
            categoryById={categoryById}
            settings={state.settings}
            selectedMonthStart={selectedMonthStart}
            transactions={state.transactions}
            selectedYear={selectedYear}
          />
        )}
        {tab === 'calendar' && (
          <YearCalendar categoryById={categoryById} selectedYear={selectedYear} transactions={state.transactions} />
        )}
        {tab === 'setup' && (
          <Setup
            settings={state.settings}
            salaryPlans={salaryPlans}
            onImportJson={importJson}
            onUpdateSettings={updateSettings}
            onExportJson={exportJson}
          />
        )}
      </section>
    </main>
  )
}

function LaunchScreen({ message }: { message: string }) {
  return (
    <main className="launch-screen">
      <div className="brand-mark">
        <IndianRupee size={24} />
      </div>
      <p>{message}</p>
    </main>
  )
}

function LandingAuth({
  message,
  onAuth,
}: {
  message: string
  onAuth: (input: { email: string; name?: string; password: string; mode: 'login' | 'signup' }) => Promise<void>
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAuth({ email, name, password, mode })
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not continue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <nav className="landing-nav">
          <div className="brand">
            <div className="brand-mark">
              <IndianRupee size={22} />
            </div>
            <div>
              <strong>{appName}</strong>
              <span>Track your disappearing salary.</span>
            </div>
          </div>
          <span className="landing-status">{message}</span>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">Because "I barely spent anything" is usually a lie.</p>

          <h1>
            Find out where your money disappeared before your salary does.
          </h1>

          <p>
            Track every chai, late-night Swiggy order, random Amazon purchase, and
            "just ₹99" subscription. Finally answer the monthly question:
            <strong> "Where did my money go?"</strong>
          </p>
        </div>

        <div className="landing-metrics" aria-label="Product highlights">
          <div>
            <ShieldCheck size={18} />
            <strong>Your secrets are safe</strong>
            <span>We know about that 2 AM food order. Nobody else has to.</span>
          </div>

          <div>
            <Smartphone size={18} />
            <strong>Log before you forget</strong>
            <span>Add expenses in seconds while you're still standing at the checkout.</span>
          </div>

          <div>
            <WalletCards size={18} />
            <strong>No more mystery spending</strong>
            <span>Budgets, insights, and receipts for every "It was just ₹199."</span>
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-label="Account access">
        <div className="auth-tabs">
          <button className={clsx(mode === 'signup' && 'active')} type="button" onClick={() => setMode('signup')}>
            Sign up
          </button>
          <button className={clsx(mode === 'login' && 'active')} type="button" onClick={() => setMode('login')}>
            Log in
          </button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sid" />
            </label>
          )}
          <label>
            Email
            <input autoComplete="email" inputMode="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button className="primary-button auth-submit" disabled={busy} type="submit">
            {busy ? 'Please wait' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Dashboard({
  monthly,
  dailyTrend,
  categoryById,
  salaryPlans,
  selectedYear,
  transactions,
}: {
  monthly: ReturnType<typeof buildMonthlyModel>
  dailyTrend: ReturnType<typeof buildDailyTrend>
  categoryById: Map<string, Category>
  salaryPlans: ReturnType<typeof buildSalaryPlans>
  selectedYear: number
  transactions: Transaction[]
}) {
  const currentPlan = salaryPlans.find((plan) => plan.year === selectedYear) ?? salaryPlans[0]
  const latest = transactions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="page-grid">
      <section className="kpi-grid">
        <KpiCard label="Monthly Salary" value={formatMoney(currentPlan.salary)} tone="blue" />
        <KpiCard label="Spent" value={formatMoney(monthly.totalActual)} detail={`${monthly.spendRatio.toFixed(0)}% of budgeted plan`} tone="rose" />
        <KpiCard label="Left" value={formatMoney(monthly.amountLeft)} detail={`${Math.max(monthly.percentageLeft, 0).toFixed(1)}% of income`} tone="green" />
        <KpiCard label="Score" value={`${monthly.score}/10`} detail={monthly.score >= 8 ? 'On track' : 'Needs attention'} tone="amber" />
      </section>

      <section className="panel wide">
        <PanelHeader title="Daily Spend" action={`${dailyTrend.length} days`} />
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="spendGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => compactMoney(Number(value))} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(label) => `Day ${label}`} />
              <Area type="monotone" dataKey="spend" stroke="#2563eb" fill="url(#spendGradient)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Budget Split" action="50 / 30 / 20" />
        <div className="budget-list">
          {monthly.typeRows.map((row) => (
            <ProgressRow key={row.type} label={row.type} actual={row.actual} budget={row.budget} color={typeColor(row.type)} />
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Category Mix" action={`${monthly.categoryRows.length} active`} />
        <div className="chart-box small">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={monthly.categoryRows} dataKey="actual" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={2}>
                {monthly.categoryRows.map((row) => (
                  <Cell key={row.categoryId} fill={categoryById.get(row.categoryId)?.color ?? '#64748b'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader title="Recent Entries" action={`${transactions.length} this month`} />
        <div className="compact-table">
          {latest.map((transaction) => {
            const category = categoryById.get(transaction.categoryId)
            return (
              <div className="compact-row" key={transaction.id}>
                <span className="color-dot" style={{ background: category?.color }} />
                <div>
                  <strong>{transaction.description}</strong>
                  <span>{formatDate(transaction.date)} · {category?.name}</span>
                </div>
                <b>{formatMoney(transaction.amount)}</b>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Ledger({
  categoryById,
  settings,
  transactions,
  onUpsert,
  onDelete,
  onExportCsv,
}: {
  categoryById: Map<string, Category>
  settings: SettingsState
  transactions: Transaction[]
  onUpsert: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onExportCsv: () => void
}) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | BudgetType>('All')
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return transactions
      .filter((transaction) => {
        const category = categoryById.get(transaction.categoryId)
        if (typeFilter !== 'All' && category?.type !== typeFilter) return false
        if (!normalizedQuery) return true
        return [transaction.description, transaction.notes, transaction.paymentMode, category?.name, category?.type]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [categoryById, query, transactions, typeFilter])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(draft.amount)
    if (!draft.description.trim() || !draft.categoryId || amount <= 0) return
    onUpsert({
      id: editingId ?? createId(),
      date: draft.date,
      description: draft.description.trim(),
      categoryId: draft.categoryId,
      amount,
      paymentMode: draft.paymentMode,
      notes: draft.notes.trim(),
    })
    setDraft({ ...emptyDraft, categoryId: settings.categories[0]?.id ?? '', paymentMode: settings.paymentModes[0] ?? '' })
    setEditingId(null)
  }

  function edit(transaction: Transaction) {
    setEditingId(transaction.id)
    setDraft({
      date: transaction.date,
      description: transaction.description,
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      paymentMode: transaction.paymentMode,
      notes: transaction.notes,
    })
  }

  return (
    <div className="ledger-layout">
      <section className="panel entry-panel">
        <PanelHeader title={editingId ? 'Edit Entry' : 'New Entry'} action="Daily tracker" />
        <form className="entry-form" onSubmit={submit}>
          <label>
            Date
            <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          </label>
          <label>
            Description
            <input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="e.g. Groceries" />
          </label>
          <label>
            Category
            <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
              {settings.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input min="0" step="0.01" type="number" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} />
          </label>
          <label>
            Payment Mode
            <select value={draft.paymentMode} onChange={(event) => setDraft({ ...draft, paymentMode: event.target.value })}>
              {settings.paymentModes.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
          <label>
            Notes
            <input value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Optional" />
          </label>
          <div className="form-actions">
            {editingId && (
              <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            )}
            <button className="primary-button" type="submit">
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel ledger-table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ledger" />
          </div>
          <Select value={typeFilter} onChange={(value) => setTypeFilter(value as 'All' | BudgetType)} label="Type">
            <option>All</option>
            {budgetTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Select>
          <button className="icon-button" type="button" onClick={onExportCsv} title="Export CSV">
            <Download size={18} />
          </button>
        </div>
        <div className="data-table">
          <div className="data-row header">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Mode</span>
            <span />
          </div>
          {filtered.map((transaction) => {
            const category = categoryById.get(transaction.categoryId)
            return (
              <div className="data-row" key={transaction.id}>
                <span>{formatDate(transaction.date)}</span>
                <span>
                  <strong>{transaction.description}</strong>
                  <small>{transaction.notes}</small>
                </span>
                <span className="pill" style={{ '--pill-color': category?.color } as CSSProperties}>
                  {category?.name ?? 'Uncategorized'}
                </span>
                <span>{formatMoney(transaction.amount)}</span>
                <span>{transaction.paymentMode}</span>
                <span className="row-actions">
                  <button className="icon-button" type="button" onClick={() => edit(transaction)} title="Edit entry">
                    <Edit3 size={16} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(transaction.id)} title="Delete entry">
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Analysis({
  categoryById,
  settings,
  selectedMonthStart,
  transactions,
  selectedYear,
}: {
  categoryById: Map<string, Category>
  settings: SettingsState
  selectedMonthStart: Date
  transactions: Transaction[]
  selectedYear: number
}) {
  const [mode, setMode] = useState<'Quarter' | 'Custom'>('Quarter')
  const [quarter, setQuarter] = useState(String(getQuarter(selectedMonthStart)))
  const [customStart, setCustomStart] = useState(format(startOfMonth(selectedMonthStart), 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(selectedMonthStart), 'yyyy-MM-dd'))
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [paymentMode, setPaymentMode] = useState('All')

  const range = useMemo(() => {
    if (mode === 'Quarter') {
      const quarterStart = startOfQuarter(new Date(selectedYear, (Number(quarter) - 1) * 3, 1))
      return { start: quarterStart, end: endOfQuarter(quarterStart) }
    }
    return { start: parseISO(customStart), end: parseISO(customEnd) }
  }, [customEnd, customStart, mode, quarter, selectedYear])

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const category = categoryById.get(transaction.categoryId)
        const date = parseISO(transaction.date)
        if (isBefore(date, range.start) || isAfter(date, range.end)) return false
        if (categoryFilter !== 'All' && categoryFilter !== category?.type && categoryFilter !== category?.id) return false
        if (paymentMode !== 'All' && transaction.paymentMode !== paymentMode) return false
        return true
      }),
    [categoryById, categoryFilter, paymentMode, range.end, range.start, transactions],
  )
  const weeklyRows = useMemo(() => buildWeeklyRows(range.start, range.end, filtered, settings.weeklyLimit), [filtered, range.end, range.start, settings.weeklyLimit])
  const paymentRows = useMemo(() => buildPaymentRows(filtered), [filtered])

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader title="Weekly Analysis" action={`${format(range.start, 'dd MMM')} - ${format(range.end, 'dd MMM')}`} />
        <div className="analysis-filters">
          <Select value={mode} onChange={(value) => setMode(value as 'Quarter' | 'Custom')} label="Mode">
            <option>Quarter</option>
            <option>Custom</option>
          </Select>
          {mode === 'Quarter' ? (
            <Select value={quarter} onChange={setQuarter} label="Quarter">
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </Select>
          ) : (
            <>
              <label className="field-label">
                Start
                <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
              </label>
              <label className="field-label">
                End
                <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
              </label>
            </>
          )}
          <Select value={categoryFilter} onChange={setCategoryFilter} label="Category">
            <option value="All">All</option>
            {budgetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            {settings.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select value={paymentMode} onChange={setPaymentMode} label="Payment">
            <option>All</option>
            {settings.paymentModes.map((modeName) => (
              <option key={modeName}>{modeName}</option>
            ))}
          </Select>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyRows}>
              <CartesianGrid stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => compactMoney(Number(value))} tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Legend />
              <Bar dataKey="spend" name="Spend" fill="#2563eb" radius={[5, 5, 0, 0]} />
              <Bar dataKey="limit" name="Limit" fill="#d6d3d1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Weekly Limit" action={formatMoney(settings.weeklyLimit)} />
        <div className="budget-list">
          {weeklyRows.map((row) => (
            <ProgressRow key={row.label} label={row.label} actual={row.spend} budget={row.limit} color={row.spend > row.limit ? '#e11d48' : '#2563eb'} />
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Payment Modes" action={`${paymentRows.length} active`} />
        <div className="budget-list">
          {paymentRows.map((row) => (
            <ProgressRow key={row.mode} label={row.mode} actual={row.amount} budget={paymentRows[0]?.amount || 1} color="#7c3aed" compact />
          ))}
        </div>
      </section>
    </div>
  )
}

function YearCalendar({
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
    <section className="panel calendar-panel">
      <PanelHeader title="Yearly Calendar" action={`Last updated: ${format(new Date(), 'HH:mm')}`} />
      <div className="year-calendar">
        {monthNames.map((month, monthIndex) => {
          const first = new Date(selectedYear, monthIndex, 1)
          const days = getDaysInMonth(first)
          const offset = (getDay(first) + 6) % 7
          return (
            <div className="month-card" key={month}>
              <h3>{month}</h3>
              <div className="calendar-weekdays">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="month-grid">
                {Array.from({ length: offset }).map((_, index) => (
                  <span key={`blank-${index}`} />
                ))}
                {Array.from({ length: days }).map((_, index) => {
                  const date = new Date(selectedYear, monthIndex, index + 1)
                  const key = format(date, 'yyyy-MM-dd')
                  const amount = daily.get(key) ?? 0
                  return (
                    <span
                      className="day-cell"
                      key={key}
                      title={`${format(date, 'dd MMM yyyy')} · ${formatMoney(amount)}`}
                      style={{ '--heat': amount / maxSpend } as CSSProperties}
                    >
                      {index + 1}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Setup({
  settings,
  salaryPlans,
  onImportJson,
  onUpdateSettings,
  onExportJson,
}: {
  settings: SettingsState
  salaryPlans: ReturnType<typeof buildSalaryPlans>
  onImportJson: (file: File) => void
  onUpdateSettings: (settings: Partial<SettingsState>) => void
  onExportJson: () => void
}) {
  const fileInput = useRef<HTMLInputElement | null>(null)

  function updateCategory(id: string, patch: Partial<Category>) {
    onUpdateSettings({
      categories: settings.categories.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    })
  }

  function addCategory() {
    onUpdateSettings({
      categories: [
        ...settings.categories,
        {
          id: slugify(`category-${Date.now()}`),
          name: 'New Category',
          type: 'Need',
          color: '#0f766e',
        },
      ],
    })
  }

  function removeCategory(id: string) {
    if (settings.categories.length <= 1) return
    onUpdateSettings({ categories: settings.categories.filter((category) => category.id !== id) })
  }

  function addPaymentMode() {
    onUpdateSettings({ paymentModes: [...settings.paymentModes, 'New Mode'] })
  }

  function updatePaymentMode(index: number, value: string) {
    onUpdateSettings({ paymentModes: settings.paymentModes.map((mode, currentIndex) => (currentIndex === index ? value : mode)) })
  }

  function removePaymentMode(index: number) {
    if (settings.paymentModes.length <= 1) return
    onUpdateSettings({ paymentModes: settings.paymentModes.filter((_, currentIndex) => currentIndex !== index) })
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImportJson(file)
    event.target.value = ''
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <PanelHeader title="Income Plan" action="5 years" />
        <div className="setup-fields">
          <label>
            Start Year
            <input type="number" value={settings.startYear} onChange={(event) => onUpdateSettings({ startYear: Number(event.target.value) })} />
          </label>
          <label>
            Salary
            <input type="number" value={settings.salary} onChange={(event) => onUpdateSettings({ salary: Number(event.target.value) })} />
          </label>
          <label>
            Annual Growth %
            <input type="number" value={settings.salaryGrowth} onChange={(event) => onUpdateSettings({ salaryGrowth: Number(event.target.value) })} />
          </label>
          <label>
            Weekly Limit
            <input type="number" value={settings.weeklyLimit} onChange={(event) => onUpdateSettings({ weeklyLimit: Number(event.target.value) })} />
          </label>
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader title="50 / 30 / 20 Projection" action="Setup sheet" />
        <div className="salary-table">
          <div className="salary-row header">
            <span>Year</span>
            <span>Salary</span>
            <span>Needs</span>
            <span>Wants</span>
            <span>Savings</span>
          </div>
          {salaryPlans.map((plan) => (
            <div className="salary-row" key={plan.year}>
              <span>{plan.year}</span>
              <span>{formatMoney(plan.salary)}</span>
              <span>{formatMoney(plan.need)}</span>
              <span>{formatMoney(plan.want)}</span>
              <span>{formatMoney(plan.saving)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader title="Categories" action={<button className="mini-button" type="button" onClick={addCategory}><Plus size={14} /> Add</button>} />
        <div className="settings-list">
          {settings.categories.map((category) => (
            <div className="settings-row" key={category.id}>
              <input type="color" value={category.color} onChange={(event) => updateCategory(category.id, { color: event.target.value })} />
              <input value={category.name} onChange={(event) => updateCategory(category.id, { name: event.target.value })} />
              <select value={category.type} onChange={(event) => updateCategory(category.id, { type: event.target.value as BudgetType })}>
                {budgetTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <button className="icon-button danger" type="button" onClick={() => removeCategory(category.id)} title="Delete category">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Payment Modes" action={<button className="mini-button" type="button" onClick={addPaymentMode}><Plus size={14} /> Add</button>} />
        <div className="settings-list">
          {settings.paymentModes.map((mode, index) => (
            <div className="settings-row payment-row" key={`${mode}-${index}`}>
              <input value={mode} onChange={(event) => updatePaymentMode(index, event.target.value)} />
              <button className="icon-button danger" type="button" onClick={() => removePaymentMode(index)} title="Delete payment mode">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader title="Portability" action="JSON / CSV" />
        <div className="portable-actions">
          <button className="primary-button" type="button" onClick={onExportJson}>
            <Download size={16} /> Export backup
          </button>
          <button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}>
            <Upload size={16} /> Import backup
          </button>
          <input ref={fileInput} hidden type="file" accept="application/json,.json" onChange={handleFile} />
        </div>
      </section>
    </div>
  )
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={clsx('nav-button', active && 'active')} type="button" onClick={onClick}>
      {icon}
      {label}
    </button>
  )
}

function Select({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: number | string
}) {
  return (
    <label className="select-label">
      <span>{label}</span>
      <span className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={14} />
      </span>
    </label>
  )
}

function KpiCard({ detail, label, tone, value }: { detail?: string; label: string; tone: string; value: string }) {
  return (
    <article className={clsx('kpi-card', tone)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  )
}

function PanelHeader({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      {action && <span>{action}</span>}
    </div>
  )
}

function ProgressRow({ actual, budget, color, compact, label }: { actual: number; budget: number; color: string; compact?: boolean; label: string }) {
  const ratio = budget > 0 ? Math.min((actual / budget) * 100, 140) : 0
  return (
    <div className="progress-row">
      <div>
        <strong>{label}</strong>
        <span>{formatMoney(actual)}{!compact && ` / ${formatMoney(budget)}`}</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${Math.min(ratio, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

function buildSalaryPlans(settings: SettingsState) {
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

function buildMonthlyModel(transactions: Transaction[], settings: SettingsState, selectedYear: number, categoryById: Map<string, Category>) {
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

function buildDailyTrend(monthStart: Date, transactions: Transaction[], categoryById: Map<string, Category>) {
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) })
  return days.map((day) => {
    const spend = transactions
      .filter((transaction) => isSameDay(parseISO(transaction.date), day))
      .filter((transaction) => categoryById.get(transaction.categoryId)?.type !== 'Saving')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    return { date: format(day, 'yyyy-MM-dd'), day: getDate(day), spend }
  })
}

function buildWeeklyRows(start: Date, end: Date, transactions: Transaction[], weeklyLimit: number) {
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

function buildPaymentRows(transactions: Transaction[]) {
  const map = new Map<string, number>()
  for (const transaction of transactions) {
    map.set(transaction.paymentMode, (map.get(transaction.paymentMode) ?? 0) + transaction.amount)
  }
  return Array.from(map.entries())
    .map(([mode, amount]) => ({ mode, amount }))
    .sort((a, b) => b.amount - a.amount)
}

function buildYearDailyTotals(year: number, transactions: Transaction[], categoryById: Map<string, Category>) {
  const map = new Map<string, number>()
  for (const transaction of transactions) {
    const date = parseISO(transaction.date)
    if (date.getFullYear() !== year) continue
    if (categoryById.get(transaction.categoryId)?.type === 'Saving') continue
    map.set(transaction.date, (map.get(transaction.date) ?? 0) + transaction.amount)
  }
  return map
}

function typeColor(type: BudgetType) {
  return type === 'Need' ? '#2563eb' : type === 'Want' ? '#f59e0b' : '#059669'
}

function getTabTitle(tab: Tab) {
  const titles: Record<Tab, string> = {
    dashboard: 'This Month',
    ledger: 'Daily Expense Tracker',
    analysis: 'Weekly Analysis',
    calendar: 'Yearly Calendar',
    setup: 'Setup',
  }
  return titles[tab]
}

async function fetchSession(token: string) {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Please sign in again')
  return (await response.json()) as { user: User; state: AppState }
}

async function authenticate(input: { email: string; name?: string; password: string; mode: 'login' | 'signup' }) {
  const response = await fetch(`/api/auth/${input.mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      password: input.password,
    }),
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? 'Authentication failed')
  }
  return (await response.json()) as { token: string; user: User; state: AppState }
}

async function logout() {
  const token = localStorage.getItem(authTokenKey)
  if (!token) return
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function saveSettings(settings: SettingsState) {
  return requestState('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

async function saveTransaction(transaction: Transaction) {
  return requestState(`/api/transactions${transaction.id ? `/${transaction.id}` : ''}`, {
    method: transaction.id ? 'PUT' : 'POST',
    body: JSON.stringify(transaction),
  })
}

async function removeTransaction(id: string) {
  return requestState(`/api/transactions/${id}`, { method: 'DELETE' })
}

async function importState(state: AppState) {
  return requestState('/api/import', {
    method: 'POST',
    body: JSON.stringify(state),
  })
}

async function resetState() {
  return requestState('/api/reset', { method: 'POST' })
}

async function requestState(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem(authTokenKey)
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? `Request failed with ${response.status}`)
  }
  return (await response.json()) as AppState
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function compactMoney(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}`
}

function formatDate(value: string) {
  return format(parseISO(value), 'dd MMM yyyy')
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default App
