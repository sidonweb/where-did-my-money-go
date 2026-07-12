import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Button className={cn('h-11 w-full justify-start gap-3 rounded-lg px-3 text-muted-foreground max-md:h-14 max-md:flex-col max-md:justify-center max-md:gap-1 max-md:px-1 max-md:text-[10px]', active && 'bg-secondary text-secondary-foreground')} variant="ghost" type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </Button>
  )
}
