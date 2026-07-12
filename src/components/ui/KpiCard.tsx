import { ArrowDownRight, ArrowUpRight, Sparkles, Wallet } from 'lucide-react'
import { Card, CardContent } from './Card'

export function KpiCard({ detail, label, tone, value }: { detail?: string; label: string; tone: string; value: string }) {
  return (
    <Card className="group relative gap-0 overflow-hidden py-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{label}</span>
        <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
          {tone === 'rose' ? <ArrowDownRight size={16} /> : tone === 'green' ? <ArrowUpRight size={16} /> : tone === 'amber' ? <Sparkles size={16} /> : <Wallet size={16} />}
        </span>
      </div>
      <strong className="mt-5 block text-2xl font-extrabold tracking-tight">{value}</strong>
      {detail && <small className="mt-1 block text-xs text-muted-foreground">{detail}</small>}
      </CardContent>
    </Card>
  )
}
