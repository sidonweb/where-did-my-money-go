import { IndianRupee } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'

export function LaunchScreen({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-content-center justify-items-center gap-4 bg-background text-sm font-semibold text-muted-foreground">
      <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
        <IndianRupee size={24} />
      </div>
      <p>{message}</p>
      <div className="grid w-72 gap-2"><Skeleton className="h-3" /><Skeleton className="h-3" /><Skeleton className="h-3" /></div>
    </main>
  )
}
