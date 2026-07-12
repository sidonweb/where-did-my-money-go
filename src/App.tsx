'use client'

import { endOfMonth, format, isWithinInterval, parseISO } from 'date-fns'
import {
  BookOpen,
  CalendarDays,
  Download,
  Filter,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Settings,
  Moon,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LandingAuth } from './components/layout/LandingAuth'
import { LaunchScreen } from './components/layout/LaunchScreen'
import { NavButton } from './components/ui/NavButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/Select'
import { Label } from './components/ui/label'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { Button } from './components/ui/Button'
import { appName, authTokenKey, initialState, monthNames, today } from './data/constants'
import { Analysis } from './screens/Analysis'
import { Dashboard } from './screens/Dashboard'
import { Guide } from './screens/Guide'
import { Ledger } from './screens/Ledger'
import { Setup } from './screens/Setup'
import { YearCalendar } from './screens/YearCalendar'
import {
  authenticate,
  fetchSession,
  importState,
  logout,
  removeTransaction,
  resetState,
  saveSettings,
  saveTransaction,
  type AuthInput,
} from './services/api'
import type { ApiStatus, AppState, SettingsState, Tab, Transaction, User } from './types'
import { downloadFile, escapeCsv } from './utils/format'
import { buildDailyTrend, buildMonthlyModel, buildSalaryPlans } from './utils/models'

function App() {
  const pathname = usePathname()
  const router = useRouter()
  const [state, setState] = useState<AppState>(initialState)
  const [authToken, setAuthToken] = useState(() => typeof window === 'undefined' ? '' : localStorage.getItem(authTokenKey) ?? '')
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const tab = getTabFromPath(pathname ?? '/')
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [apiMessage, setApiMessage] = useState('Connecting to PostgreSQL')
  const lastShakeAt = useRef(0)

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

  useEffect(() => {
    let motionPermissionAsked = false

    async function requestMotionPermission() {
      if (motionPermissionAsked) return
      motionPermissionAsked = true
      const motionEvent = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
      await motionEvent.requestPermission?.().catch(() => undefined)
    }

    function openLedgerOnShake(event: DeviceMotionEvent) {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return
      const force = Math.abs(acceleration.x ?? 0) + Math.abs(acceleration.y ?? 0) + Math.abs(acceleration.z ?? 0)
      const now = Date.now()
      if (force > 34 && now - lastShakeAt.current > 1200) {
        lastShakeAt.current = now
        router.push('/ledger')
      }
    }

    window.addEventListener('pointerdown', requestMotionPermission, { once: true })
    window.addEventListener('devicemotion', openLedgerOnShake)
    return () => {
      window.removeEventListener('pointerdown', requestMotionPermission)
      window.removeEventListener('devicemotion', openLedgerOnShake)
    }
  }, [router])

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
    await persist(resetState, 'Workspace reset')
    setSelectedMonth(today.getMonth())
    setSelectedYear(today.getFullYear())
  }

  async function importJson(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as AppState
      if (!parsed.settings || !Array.isArray(parsed.transactions)) throw new Error('This is not a valid Track Your Money backup')
      await persist(() => importState(parsed), 'Backup imported')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not import backup'
      toast.error('Import failed', { description: message })
    }
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

  async function persist(action: () => Promise<AppState>, successMessage?: string) {
    setApiStatus('saving')
    setApiMessage('Saving')
    try {
      const serverState = await action()
      setState(serverState)
      setApiStatus('online')
      setApiMessage('Saved')
      if (successMessage) toast.success(successMessage)
    } catch (error) {
      setApiStatus('offline')
      setApiMessage(error instanceof Error ? error.message : 'Database sync failed')
      toast.error('Changes were not saved', { description: error instanceof Error ? error.message : 'Database sync failed' })
    }
  }

  async function handleAuth(input: AuthInput) {
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
      toast.error('Could not sign in', { description: error instanceof Error ? error.message : 'Authentication failed' })
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
    <main className="min-h-screen bg-background md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 p-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:sticky md:top-0 md:h-screen md:border-t-0 md:border-r md:p-5">
        <div className="hidden items-center gap-3 md:flex">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <IndianRupee size={22} />
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-sm font-semibold text-foreground">{appName}</strong>
            <span className="text-[10px] font-medium tracking-[.18em] text-muted-foreground uppercase">Money OS</span>
          </div>
        </div>

        <nav className="grid grid-cols-6 gap-1 md:mt-10 md:grid-cols-1 md:gap-1.5" aria-label="Primary">
          <NavButton icon={<LayoutDashboard size={18} />} label="Dashboard" active={tab === 'dashboard'} onClick={() => router.push('/dashboard')} />
          <NavButton icon={<Filter size={18} />} label="Analysis" active={tab === 'analysis'} onClick={() => router.push('/analysis')} />
          <NavButton icon={<WalletCards size={18} />} label="Ledger" active={tab === 'ledger'} onClick={() => router.push('/ledger')} />
          <NavButton icon={<CalendarDays size={18} />} label="Calendar" active={tab === 'calendar'} onClick={() => router.push('/calendar')} />
          <NavButton icon={<BookOpen size={18} />} label="Guide" active={tab === 'guide'} onClick={() => router.push('/guide')} />
          <NavButton icon={<Settings size={18} />} label="Setup" active={tab === 'setup'} onClick={() => router.push('/setup')} />
        </nav>

        <div className="mt-auto hidden space-y-2 md:block md:absolute md:right-5 md:bottom-5 md:left-5">
          <div className="mb-3 flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Moon size={14} />Appearance</span><ThemeToggle /></div>
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className={`size-2 rounded-full ${apiStatus === 'online' ? 'bg-foreground' : apiStatus === 'saving' || apiStatus === 'loading' ? 'animate-pulse bg-muted-foreground' : 'bg-destructive'}`} />
            {apiMessage}
          </div>
          <Button className="w-full" variant="outline" type="button" onClick={exportJson}>
            <Download size={16} /> Backup
          </Button>
          <ConfirmDialog
            destructive
            title="Reset your workspace?"
            description="This permanently replaces your settings and transactions with the default data. Export a backup first if you may need them later."
            confirmLabel="Reset workspace"
            onConfirm={() => void resetDemo()}
            trigger={<Button className="w-full" variant="outline" type="button"><RotateCcw size={16} /> Reset</Button>}
          />
          <Button className="w-full text-muted-foreground hover:text-foreground" variant="ghost" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      <section className="min-w-0 px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:pt-7 md:pb-8">
        <header className="mb-7 flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[11px] font-extrabold tracking-[.2em] text-primary uppercase">
              {monthNames[selectedMonth]} {selectedYear}
            </p>
            <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{getTabTitle(tab)}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back, {user.name} <span className="hidden sm:inline">· {user.email}</span>
            </p>
          </div>
          <div className="flex items-end gap-2">
            <ThemeToggle />
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Month</Label>
              <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger className="min-w-28"><SelectValue /></SelectTrigger>
                <SelectContent>{monthNames.map((month, index) => <SelectItem key={month} value={String(index)}>{month}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Year</Label>
              <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger className="min-w-28"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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
        {tab === 'analysis' && (
          <Analysis
            categoryById={categoryById}
            settings={state.settings}
            selectedMonthStart={selectedMonthStart}
            transactions={state.transactions}
            selectedYear={selectedYear}
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
        {tab === 'calendar' && <YearCalendar categoryById={categoryById} selectedYear={selectedYear} transactions={state.transactions} />}
        {tab === 'guide' && <Guide />}
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

function getTabTitle(tab: Tab) {
  const titles: Record<Tab, string> = {
    dashboard: 'This Month',
    ledger: 'Daily Expense Tracker',
    analysis: 'Weekly Analysis',
    calendar: 'Yearly Calendar',
    guide: 'Guide',
    setup: 'Setup',
  }
  return titles[tab]
}

function getTabFromPath(pathname: string): Tab {
  const candidate = pathname.split('/').filter(Boolean)[0]
  return candidate === 'analysis' || candidate === 'ledger' || candidate === 'calendar' || candidate === 'guide' || candidate === 'setup'
    ? candidate
    : 'dashboard'
}

export default App
