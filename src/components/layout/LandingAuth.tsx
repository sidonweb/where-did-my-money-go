import { IndianRupee, ShieldCheck, Smartphone, WalletCards } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { appName } from '../../data/constants'
import type { AuthInput } from '../../services/api'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/label'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export function LandingAuth({ message, onAuth }: { message: string; onAuth: (input: AuthInput) => Promise<void> }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onAuth({ email, name, password, mode })
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not continue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,.75fr)] lg:items-center lg:gap-12 lg:p-8">
      <section className="flex min-h-[calc(100vh-4rem)] flex-col justify-between gap-10">
        <nav className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <IndianRupee size={22} />
            </div>
            <div>
              <strong className="block text-sm font-extrabold">{appName}</strong>
              <span className="block text-xs text-muted-foreground">Track your disappearing salary.</span>
            </div>
          </div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full border bg-card/70 px-3 py-2 text-xs font-semibold text-muted-foreground sm:block">{message}</span><ThemeToggle /></div>
        </nav>

        <div>
          <p className="mb-3 text-xs font-extrabold tracking-[.2em] text-primary uppercase">Mobile-first money clarity</p>
          <h1 className="max-w-4xl text-5xl leading-[.92] font-black tracking-[-.06em] sm:text-7xl">Find where your salary leaked before month-end hits.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Log spends quickly, compare them with a 50 / 30 / 20 plan, and spot the little payments that quietly become a big number.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3" aria-label="Product highlights">
          {[
            [ShieldCheck, 'Private by default', 'Your ledger is yours, from rent to every late-night food order.'],
            [Smartphone, 'Built for thumbs', 'On mobile, the ledger sits in the middle and stays one tap away.'],
            [WalletCards, 'Budget with context', 'Needs, wants, savings, payment modes, and trends in one clean view.'],
          ].map(([Icon, title, copy]) => (
            <Card className="gap-2 bg-card/60 p-4 py-4 backdrop-blur" key={String(title)}>
              <Icon className="text-primary" size={18} />
              <strong className="text-sm">{String(title)}</strong>
              <span className="text-xs leading-5 text-muted-foreground">{String(copy)}</span>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mx-auto my-10 w-full max-w-md gap-0 bg-card/85 py-0 shadow-2xl backdrop-blur-xl lg:my-0" aria-label="Account access">
        <CardContent className="p-5">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="signup">Sign up</TabsTrigger><TabsTrigger value="login">Log in</TabsTrigger></TabsList>
        </Tabs>
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          {mode === 'signup' && (
            <div className="grid gap-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Sid" /></div>
          )}
          <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" autoComplete="email" inputMode="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
          <div className="grid gap-1.5"><Label htmlFor="password">Password</Label><Input
              id="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            /></div>
          {error && <Alert className="border-destructive/30 bg-destructive/10"><AlertDescription className="text-destructive">{error}</AlertDescription></Alert>}
          <Button className="w-full" disabled={busy} type="submit">
            {busy ? 'Please wait' : mode === 'signup' ? 'Create account' : 'Log in'}
          </Button>
        </form>
        </CardContent>
      </Card>
    </main>
  )
}
