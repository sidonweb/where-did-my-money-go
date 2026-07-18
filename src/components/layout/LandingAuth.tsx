'use client'

import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  LockKeyhole,
  Moon,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  Sun,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { appName } from '../../data/constants'
import type { AuthInput } from '../../services/api'
import { BrandWordmark } from './BrandWordmark'
import { useTheme } from '../theme/ThemeProvider'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/label'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import Link from 'next/link'

const githubUrl = 'https://github.com/sidonweb/where-did-my-money-go'

const stats = [
  ['50/30/20', 'planning built in'],
  ['0–10', 'money health score'],
  ['6', 'ways to analyse'],
  ['0', 'data sold'],
]

const examples = [
  {
    title: 'Salary lands on the 27th',
    eyebrow: 'Salary cycle',
    status: 'Handled',
    copy: 'Plan from payday to payday instead of forcing your life into a calendar month.',
  },
  {
    title: '₹420 in small UPI spends',
    eyebrow: 'Daily leakage',
    status: 'Visible',
    copy: 'The forgettable payments stay attached to a day, category, and payment mode.',
  },
  {
    title: '₹10,000 moved to an SIP',
    eyebrow: 'Future you',
    status: 'Counted',
    copy: 'Savings are part of the plan—not whatever happens to be left at month-end.',
  },
  {
    title: 'UPI, cards, cash, transfers',
    eyebrow: 'One ledger',
    status: 'Together',
    copy: 'See the whole money story without stitching together five different apps.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Set your real plan',
    copy: 'Add income, choose a calendar or salary cycle, and shape categories around your life.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Log money in seconds',
    copy: 'Capture expenses, income, and savings with the payment context you will need later.',
    icon: ReceiptText,
  },
  {
    number: '03',
    title: 'See the pattern',
    copy: 'Compare needs, wants, and savings; scan trends; and spot the categories drifting off plan.',
    icon: BarChart3,
  },
  {
    number: '04',
    title: 'Ask a better question',
    copy: 'Use grounded AI analysis to understand your own data without giving it database access.',
    icon: Sparkles,
  },
]

const comparisonRows = [
  ['Planning', 'Calendar or salary cycle', 'Usually calendar-only'],
  ['Budget model', 'Needs, wants, and savings', 'One generic spend limit'],
  ['Context', 'Category + payment mode + notes', 'Amount and merchant'],
  ['Analysis', 'Weekly to yearly + Ask AI', 'Basic monthly totals'],
  ['Privacy', 'Private account workspace', 'Often ad or aggregation driven'],
  ['Price', 'Free to start', 'Paywall before clarity'],
]

const faqs = [
  {
    question: 'How is this different from a bank app?',
    answer: 'A bank app tells you what cleared. This workspace lets you decide what it meant, how it fits your plan, and what the pattern says across accounts and payment modes.',
  },
  {
    question: 'Does salary-cycle budgeting really work?',
    answer: 'Yes. Add income entries and the app can treat each payday as the start of a new budget cycle, while calendar-month mode remains available whenever it suits you better.',
  },
  {
    question: 'What happens with irregular income?',
    answer: 'You can log income as it arrives and use categories, notes, and custom analysis ranges to keep the story accurate. The tool is flexible, but it does not forecast income you have not entered.',
  },
  {
    question: 'How is the 0–10 score calculated?',
    answer: 'It compares spending against your needs, wants, and savings plan, then applies penalties for going over budget or falling short on savings. It is a directional signal, not a credit score.',
  },
  {
    question: 'What does 50/30/20 mean?',
    answer: 'It is a starting framework: roughly 50% of income for needs, 30% for wants, and 20% for savings. You can customize the underlying categories to match your life.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. The product helps you organise and understand the information you enter. It does not replace a qualified financial adviser, tax professional, or accountant.',
  },
  {
    question: 'How much does it cost, and who made it?',
    answer: 'You can start free. This is an independent, open-source project built to make everyday money decisions easier to see and less exhausting to manage.',
  },
]

export function LandingAuth({ message, onAuth }: { message: string; onAuth: (input: AuthInput) => Promise<void> }) {
  const { setTheme: setAppTheme } = useTheme()
  const [landingTheme, setLandingTheme] = useState<'light' | 'dark'>('light')
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [authOpen, setAuthOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.landingActive = 'true'
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    return () => {
      delete root.dataset.landingActive
      const appIsDark = localStorage.getItem('app-theme') === 'dark'
      root.classList.toggle('dark', appIsDark)
      root.style.colorScheme = appIsDark ? 'dark' : 'light'
    }
  }, [])

  useEffect(() => {
    setLandingTheme(localStorage.getItem('landing-theme') === 'dark' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (!authOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAuthOpen(false)
    }
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [authOpen])

  function openAuth(nextMode: 'login' | 'signup') {
    setMode(nextMode)
    setError('')
    setAuthOpen(true)
  }

  function toggleLandingTheme() {
    const nextTheme = landingTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('landing-theme', nextTheme)
    setLandingTheme(nextTheme)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAuth({ email, name, password, mode })
      if (mode === 'signup') setAppTheme('light')
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not continue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={`landing-surface min-h-screen overflow-hidden bg-background text-foreground ${landingTheme === 'dark' ? 'landing-dark' : ''}`}>
      <a className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground" href="#main-content">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <a className="mr-auto flex items-center gap-2.5" href="#top" aria-label={`${appName} home`}>
            <span className="font-bold font-sans text-3xl">{appName}</span>
          </a>

          <div className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            <a className="transition-colors hover:text-foreground" href="#idea">The idea</a>
            <a className="transition-colors hover:text-foreground" href="#features">How it works</a>
            <a className="transition-colors hover:text-foreground" href="#comparison">Compare</a>
            <a className="transition-colors hover:text-foreground" href="#faq">FAQ</a>
          </div>

          <a className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:flex" href={githubUrl} target="_blank" rel="noreferrer">
            <Code2 size={17} /> GitHub
          </a>
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => openAuth('login')}>Sign in</Button>
          <Button onClick={() => openAuth('signup')}>Start free <ArrowRight /></Button>
          <Button aria-label={`Switch landing page to ${landingTheme === 'dark' ? 'light' : 'dark'} mode`} className="shrink-0" onClick={toggleLandingTheme} size="icon" title={`Switch landing page to ${landingTheme === 'dark' ? 'light' : 'dark'} mode`} type="button" variant="outline">
            {landingTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
        </nav>
      </header>

      <div id="main-content">
        <section id="top" className="relative scroll-mt-20 border-b">
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-20 pb-14 sm:px-6 sm:pt-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pt-32 lg:pb-20">
            <div>
              <p className="mb-5 font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">Personal finance, made clear</p>
              <h1 className="max-w-2xl text-5xl leading-[.98] font-bold tracking-[-.06em] sm:text-6xl lg:text-[4rem]">
                Know where your money went <span className="text-primary">before</span> the month ends.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                Track daily spending, plan around your real payday, and turn a pile of transactions into one clear next decision.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Button size="lg" className="h-12 px-7" onClick={() => openAuth('signup')}>Create your free account <ArrowRight /></Button>
                <button className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" onClick={() => openAuth('login')} type="button">Sign in instead</button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck className="text-primary" size={14} /> Private workspace</span>
                <span className="flex items-center gap-1.5"><Check className="text-primary" size={14} /> Free to start</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] text-[#FAFAFA] shadow-xl shadow-black/20">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-[#A3A3A3] uppercase">
                    <span className="size-2 rounded-full bg-[#7FD3FF]" /> April overview
                  </div>
                  <span className="rounded-full bg-[#1A1A1A] px-2.5 py-1 font-mono text-[9px] text-[#A3A3A3]">27 Mar—26 Apr</span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="font-mono text-[10px] tracking-wider text-[#A3A3A3] uppercase">Left this cycle</p>
                      <strong className="mt-2 block text-4xl tracking-[-.055em]">₹18,240</strong>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] text-[#A3A3A3] uppercase">Money score</p>
                      <strong className="mt-1 block text-2xl text-[#7FD3FF]">8.6<span className="text-xs text-[#A3A3A3]"> / 10</span></strong>
                    </div>
                  </div>
                  <div className="mt-8 grid gap-4">
                    {[['Needs', '42%', '50%'], ['Wants', '24%', '30%'], ['Savings', '21%', '20%']].map(([label, value, target]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center font-mono text-[9px] text-[#A3A3A3]"><span>{label}</span><span className="ml-auto text-[#FAFAFA]">{value} <span className="text-[#A3A3A3]">/ {target}</span></span></div>
                        <div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#7FD3FF]" style={{ width: value }} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 font-mono text-[10px] text-[#A3A3A3]">
                    <BarChart3 className="text-[#7FD3FF]" size={14} /> On track for this salary cycle
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto grid max-w-7xl grid-cols-2 border-x border-t sm:grid-cols-4">
            {stats.map(([value, label], index) => (
              <div className={`px-5 py-6 sm:px-7 ${index % 2 ? '' : 'border-r'} ${index > 1 ? 'border-t sm:border-t-0' : ''} sm:border-r sm:last:border-r-0`} key={value}>
                <strong className="block font-mono text-2xl text-primary sm:text-3xl">{value}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="idea" className="scroll-mt-20 border-b px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.4fr_1fr]">
            <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">01 / The idea</p>
            <div>
              <h2 className="max-w-4xl text-3xl leading-tight font-bold tracking-[-.045em] sm:text-5xl">Most money apps record the past. This one helps you understand it.</h2>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">A clean ledger is only the beginning. Your spending is organised around the way you are paid, measured against a simple plan, and turned into patterns you can actually act on—without asking you to become a spreadsheet person.</p>
            </div>
          </div>
        </section>

        <section className="border-b bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">Your money score</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] sm:text-5xl">One signal. The detail behind it.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">A 0–10 score makes the month readable at a glance. Then you can open the categories and daily trend to see exactly what moved it.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                ['0–4.9', 'Reset the plan', 'Spending has moved well beyond the current income plan. Start with the biggest category, not every small purchase.'],
                ['5–7.9', 'Getting steadier', 'The plan is working in parts. A few categories or a savings gap need attention before the cycle closes.'],
                ['8–10', 'On track', 'Needs, wants, and savings are close to plan. Keep the rhythm and protect what is already working.'],
              ].map(([range, title, copy], index) => (
                <article className={`rounded-2xl border p-6 ${index === 2 ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`} key={range}>
                  <span className={`font-mono text-3xl font-bold ${index === 2 ? '' : 'text-primary'}`}>{range}</span>
                  <h3 className="mt-8 text-lg font-bold">{title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${index === 2 ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">Real-life proof</p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] sm:text-5xl">Built for how money actually moves.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">Not just neat monthly charts. The awkward dates, tiny payments, intentional savings, and mixed payment modes all stay visible.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {examples.map((example) => (
                <article className="group rounded-2xl border bg-card p-6 transition-transform hover:-translate-y-1" key={example.title}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] font-bold tracking-[.14em] text-muted-foreground uppercase">{example.eyebrow}</span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-[10px] font-bold text-primary">{example.status}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold tracking-[-.03em]">{example.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{example.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">02 / How it works</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] sm:text-5xl">Plan. Log. See. Decide.</h2>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <article className="overflow-hidden rounded-2xl border bg-background" key={step.number}>
                    <div className="flex min-h-64 items-center justify-center border-b bg-[linear-gradient(135deg,rgba(43,93,138,.10),transparent_55%)] p-7">
                      <div className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-lg">
                        <div className="mb-5 flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon size={17} /></span><span className="font-mono text-[9px] text-muted-foreground">STEP {step.number}</span></div>
                        {index === 0 && <><p className="text-xs font-bold">Budget cycle</p><div className="mt-3 flex rounded-lg bg-background p-1 text-[10px]"><span className="flex-1 rounded-md px-3 py-2 text-center text-muted-foreground">Calendar</span><span className="flex-1 rounded-md bg-primary px-3 py-2 text-center font-bold text-primary-foreground">Salary cycle</span></div></>}
                        {index === 1 && <div className="grid gap-2">{[['Dinner out', '₹2,180'], ['Metro recharge', '₹930'], ['April SIP', '₹10,000']].map(([item, amount]) => <div className="flex items-center rounded-lg bg-background px-3 py-2 text-xs" key={item}><span>{item}</span><span className="ml-auto font-mono font-bold">{amount}</span></div>)}</div>}
                        {index === 2 && <div className="grid gap-3">{[['Needs', '68%'], ['Wants', '44%'], ['Savings', '82%']].map(([item, value], rowIndex) => <div key={item}><div className="mb-1.5 flex text-[10px]"><span>{item}</span><span className="ml-auto font-mono">{value}</span></div><div className="h-2 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${[68, 44, 82][rowIndex]}%` }} /></div></div>)}</div>}
                        {index === 3 && <><div className="rounded-xl rounded-bl-sm bg-background p-3 text-xs leading-5">Where did I overspend this cycle?</div><div className="mt-2 ml-7 rounded-xl rounded-br-sm border border-primary/30 bg-primary/10 p-3 text-xs leading-5"><span className="font-mono text-[9px] font-bold text-primary">GROUNDED ANSWER</span><br />Lifestyle was ₹2,840 over plan, led by dining and weekend travel.</div></>}
                      </div>
                    </div>
                    <div className="p-6 sm:p-7">
                      <span className="font-mono text-xs font-bold text-primary">{step.number}</span>
                      <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.copy}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="comparison" className="scroll-mt-20 border-b px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">03 / Compare</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] sm:text-5xl">Clarity beats another spending chart.</h2>
            </div>
            <div className="mt-12 overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-card">
                  <tr><th className="p-4 font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:p-5">What matters</th><th className="border-l border-primary/30 bg-primary/10 p-4 text-primary sm:p-5">{appName}</th><th className="border-l p-4 text-muted-foreground sm:p-5">Typical tracker</th></tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, ours, typical]) => (
                    <tr className="border-t" key={label}>
                      <th className="p-4 font-medium sm:p-5">{label}</th>
                      <td className="border-l border-primary/30 bg-primary/5 p-4 sm:p-5"><span className="flex items-start gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={15} />{ours}</span></td>
                      <td className="border-l p-4 text-muted-foreground sm:p-5">{typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-b bg-[#2B5D8A] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
          <figure className="mx-auto max-w-5xl text-center">
            <blockquote className="mt-8 text-3xl leading-tight font-bold tracking-[-.045em] sm:text-5xl">“Money clarity shouldn’t require becoming a spreadsheet person.”</blockquote>
            <Link href="https://sidonweb.com" target="_blank" rel="noreferrer">
              <figcaption className="mt-7 font-mono text-xs font-bold tracking-[.12em] uppercase">Siddharth Singh</figcaption>
            </Link>
          </figure>
        </section>

        <section id="faq" className="scroll-mt-20 border-b px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.65fr_1fr]">
            <div>
              <p className="font-mono text-xs font-bold tracking-[.16em] text-primary uppercase">04 / FAQ</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-.045em] sm:text-5xl">The sensible questions.</h2>
              <p className="mt-5 max-w-md leading-7 text-muted-foreground">What it does, what it does not do, and how to tell if it fits your money routine.</p>
            </div>
            <div className="border-t">
              {faqs.map((faq) => (
                <details className="group border-b py-1" key={faq.question}>
                  <summary className="flex list-none cursor-pointer items-center gap-5 py-5 font-bold [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span><ChevronRight className="ml-auto shrink-0 text-primary transition-transform group-open:rotate-90" size={18} />
                  </summary>
                  <p className="max-w-2xl pb-6 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#111111] px-6 py-16 text-[#FAFAFA] sm:px-12 lg:px-20 lg:py-20">
            <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#7FD3FF]/20 blur-3xl" />
            <div className="relative max-w-3xl">
              <p className="font-mono text-xs font-bold tracking-[.16em] text-[#7FD3FF] uppercase">Start with the next transaction</p>
              <h2 className="mt-5 text-4xl leading-tight font-bold tracking-[-.055em] sm:text-6xl">Know where your money went before the month ends.</h2>
              <p className="mt-6 max-w-2xl leading-7 text-[#A3A3A3]">Create your workspace, set the plan, and make the next money decision with the full picture in front of you.</p>
              <p className="mt-5 font-mono text-[10px] leading-5 text-[#A3A3A3]">For organisation and informational use only. Not financial, tax, or investment advice.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-7" onClick={() => openAuth('signup')}>Start free <ArrowRight /></Button>
                <Button size="lg" className="h-12 border-white/20 bg-transparent px-7 text-[#FAFAFA] hover:bg-white/10 hover:text-[#FAFAFA]" variant="outline" onClick={() => openAuth('login')}>Sign in</Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t bg-card px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <BrandWordmark className="text-xl text-foreground" />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Know where your money went before the month ends.</p>
            </div>
            <FooterLinks title="Product" links={[["The idea", '#idea'], ['How it works', '#features'], ['Compare', '#comparison'], ['FAQ', '#faq']]} />
            <FooterLinks title="Project" links={[["GitHub", githubUrl], ['Contributing', `${githubUrl}#contributing`], ['README', `${githubUrl}#readme`]]} />
            <FooterLinks title="Built with" links={[["Next.js", 'https://nextjs.org'], ['React', 'https://react.dev'], ['PostgreSQL', 'https://www.postgresql.org']]} />
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t pt-6 font-mono text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} {appName}</span>
            <span>Independent · open source · built for everyday money</span>
          </div>
        </div>
      </footer>

      {authOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false) }} role="presentation">
          <section className="relative w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="absolute top-4 right-4 grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground" onClick={() => setAuthOpen(false)} type="button" aria-label="Close account dialog"><X size={18} /></button>
            <div className="pr-12">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><WalletCards size={19} /></span>
              <h2 id="auth-title" className="mt-5 text-2xl font-bold tracking-[-.04em]">{mode === 'signup' ? 'Create your workspace' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{mode === 'signup' ? 'Start turning transactions into a plan.' : 'Your money story is right where you left it.'}</p>
            </div>
            <Tabs className="mt-6" value={mode} onValueChange={(value) => { setMode(value as 'login' | 'signup'); setError('') }}>
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="signup">Sign up</TabsTrigger><TabsTrigger value="login">Log in</TabsTrigger></TabsList>
            </Tabs>
            <form className="mt-5 grid gap-4" onSubmit={submit}>
              {mode === 'signup' && (
                <div className="grid gap-1.5"><Label htmlFor="name">Name</Label><Input id="name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required /></div>
              )}
              <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" autoFocus={mode === 'login'} autoComplete="email" inputMode="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
              <div className="grid gap-1.5"><Label htmlFor="password">Password</Label><Input id="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /></div>
              {error && <Alert className="border-destructive/30 bg-destructive/10"><AlertDescription className="text-destructive">{error}</AlertDescription></Alert>}
              <Button className="mt-1 h-11 w-full" disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}{!busy && <ArrowRight />}</Button>
            </form>
            <div className="mt-5 flex items-center gap-2 border-t pt-4 font-mono text-[9px] leading-4 text-muted-foreground"><LockKeyhole className="shrink-0 text-primary" size={13} /> Secure account access · {message}</div>
          </section>
        </div>
      )}
    </main>
  )
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] font-bold tracking-[.14em] text-foreground uppercase">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
        {links.map(([label, href]) => <li key={label}><a className="transition-colors hover:text-primary" href={href}>{label}</a></li>)}
      </ul>
    </div>
  )
}
