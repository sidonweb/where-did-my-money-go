import type { ReactNode } from 'react'
import { CardTitle } from './Card'

export function PanelHeader({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
      {action && <span className="text-xs font-semibold text-muted-foreground">{action}</span>}
    </div>
  )
}
