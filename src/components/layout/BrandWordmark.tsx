import { appName } from '../../data/constants'
import { cn } from '../../utils/cn'

export function BrandWordmark({ animated = false, className }: { animated?: boolean; className?: string }) {
  return (
    <span className={cn('inline-block font-sans font-bold tracking-[-.065em]', animated && 'brand-throb', className)}>
      {appName}
    </span>
  )
}
