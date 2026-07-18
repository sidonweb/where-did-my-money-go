import type { CSSProperties } from 'react'

export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  boxShadow: '0 12px 30px rgb(0 0 0 / 18%)',
  color: 'var(--popover-foreground)',
}

export const chartTooltipLabelStyle: CSSProperties = {
  color: 'var(--muted-foreground)',
  fontWeight: 600,
  marginBottom: '4px',
}

export const chartTooltipItemStyle: CSSProperties = {
  color: 'var(--popover-foreground)',
}
