import { BookOpen, CalendarCheck, PieChart, ReceiptText, WalletCards } from 'lucide-react'
import { PanelHeader } from '../components/ui/PanelHeader'
import { Card, CardContent, CardHeader } from '../components/ui/Card'

const steps = [
  {
    icon: <WalletCards size={18} />,
    title: 'Set your income plan',
    text: 'Add salary, expected growth, and a weekly comfort limit in Setup. The app turns that into monthly guardrails.',
  },
  {
    icon: <ReceiptText size={18} />,
    title: 'Log every transaction',
    text: 'Use Ledger for spends, savings transfers, payment modes, categories, and notes. Small entries create the real picture.',
  },
  {
    icon: <PieChart size={18} />,
    title: 'Review the month',
    text: 'Dashboard compares actual spending with your planned Needs, Wants, and Savings so you can see what changed.',
  },
  {
    icon: <CalendarCheck size={18} />,
    title: 'Spot patterns',
    text: 'Analysis and Calendar show weekly spikes, payment-mode habits, and high-spend days across the year.',
  },
]

export function Guide() {
  return (
    <div className="grid gap-4">
      <section className="relative grid min-h-72 overflow-hidden rounded-xl border bg-primary p-7 text-primary-foreground shadow-sm md:grid-cols-[1fr_260px] md:items-center">
        <div>
          <p className="mb-2 text-[11px] font-extrabold tracking-[.2em] text-primary-foreground/70 uppercase">How it works</p>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight md:text-5xl">Track money by behavior, not guilt.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/75">
            This app keeps your daily ledger connected to a simple budget framework, so every entry teaches you where your money actually goes.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 md:mt-0">
          {[50, 30, 20].map((value) => <span className="grid aspect-square place-items-center rounded-xl border border-white/15 bg-white/10 text-3xl font-black backdrop-blur" key={value}>{value}</span>)}
        </div>
      </section>

      <Card><CardHeader><PanelHeader title="The 50 / 30 / 20 Rule" action={<BookOpen size={16} />} /></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">
        {[
          ['50% Needs', 'Rent, groceries, bills, commute, health, and other life infrastructure you must pay for.'],
          ['30% Wants', 'Food delivery, shopping, subscriptions, trips, entertainment, gifts, and lifestyle choices.'],
          ['20% Savings', 'SIPs, emergency fund, debt payoff, investments, and money you intentionally keep for future you.'],
        ].map(([title, text]) => <Card className="gap-2 bg-background/40 p-4 py-4 shadow-none" key={title}><strong className="text-sm font-bold">{title}</strong><p className="text-sm leading-6 text-muted-foreground">{text}</p></Card>)}
      </CardContent></Card>

      <Card><CardHeader><PanelHeader title="Using the Application" action="Daily flow" /></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <Card className="flex-row gap-3 bg-background/40 p-4 py-4 shadow-none" key={step.title}>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">{step.icon}</span>
              <div>
                <strong className="mb-2 block text-sm font-bold">{step.title}</strong>
                <p className="text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            </Card>
          ))}
      </CardContent></Card>
    </div>
  )
}
