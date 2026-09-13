'use client'

import { FormEvent, useState } from 'react'
import { LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useGame } from '@/lib/game-context'

export function AuthScreen() {
  const { signIn, signUp } = useGame()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await (mode === 'signin' ? signIn(email, password) : signUp(email, password))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <section className="glass-strong w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span><div><p className="font-display text-xl font-bold">LifeQuest</p><p className="text-xs text-muted-foreground">Your life, leveled up.</p></div></div>
        <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">{mode === 'signin' ? 'Welcome back' : 'Begin your journey'}</p>
        <h1 className="font-display text-3xl font-bold">{mode === 'signin' ? 'Sign in to your quest log' : 'Create your warrior account'}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Keep your habits, quests, XP, and rewards synced wherever you play.</p>
        <p className="mt-4 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-3 py-2 text-xs text-[var(--gold)]">Development mode: any email label and password will work.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block"><span className="mb-2 block text-sm font-medium">Email label</span><span className="relative block"><Mail className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" /><input required type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pr-3 pl-10 text-sm outline-none focus:border-primary" placeholder="Enter anything" /></span></label>
          <label className="block"><span className="mb-2 block text-sm font-medium">Password</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" /><input required type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pr-3 pl-10 text-sm outline-none focus:border-primary" placeholder="Enter anything" /></span></label>
          {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <button disabled={submitting} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Connecting...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">{mode === 'signin' ? 'New to LifeQuest?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }} className="font-semibold text-primary hover:underline">{mode === 'signin' ? 'Sign up' : 'Sign in'}</button></p>
      </section>
    </main>
  )
}