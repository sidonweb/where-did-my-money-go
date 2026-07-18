import { BrandWordmark } from './BrandWordmark'

export function LaunchScreen() {
  return (
    <main className="grid min-h-screen place-content-center bg-background text-foreground">
      <BrandWordmark animated className="text-4xl" />
    </main>
  )
}
