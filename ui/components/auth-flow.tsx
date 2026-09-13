'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { useGame } from '@/lib/game-context'

export function AuthFlow({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const { account, signIn, signUp } = useGame()
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (account) router.replace('/') }, [account, router])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (isSignup && name.trim().length < 2) return setError('Enter your name')
    if (!email.includes('@')) return setError('Enter a valid email address')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (isSignup && password !== confirmPassword) return setError('Passwords do not match')
    setBusy(true)
    try { if (isSignup) await signUp(email.trim(), password, name.trim()); else await signIn(email.trim(), password); router.replace('/') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to continue') } finally { setBusy(false) }
  }

  return <main className="grid min-h-dvh lg:grid-cols-2"><section className="relative hidden overflow-hidden bg-[#171124] p-10 lg:flex lg:flex-col lg:justify-between"><div className="absolute -top-32 right-[-10%] size-[34rem] rounded-full bg-primary/20 blur-[100px]" /><div className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span><span className="font-display text-xl font-bold">LifeQuest</span></div><div className="relative max-w-md"><p className="mb-5 text-xs font-semibold tracking-[.25em] text-[var(--gold)] uppercase">Your Life. Your Progress.</p><h1 className="font-display text-5xl font-bold leading-tight">Build consistency.<br /><span className="text-gradient">See your progress.</span><br />Reward yourself.</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">A quiet system for the work that matters, designed to make your progress visible.</p></div><div className="relative text-sm text-muted-foreground">LifeQuest · Personal progress, made tangible.</div></section><section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-md"><Link href="/" className="mb-12 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span><span className="font-display text-xl font-bold">LifeQuest</span></Link><p className="mb-3 text-xs font-semibold tracking-[.25em] text-primary uppercase">{isSignup ? 'Begin your journey' : 'Welcome back'}</p><h2 className="font-display text-4xl font-bold">{isSignup ? 'Create your account' : 'Continue your journey.'}</h2><p className="mt-3 text-muted-foreground">{isSignup ? 'Start building your progress.' : 'Your next level is waiting.'}</p><form onSubmit={submit} className="mt-8 space-y-4">{isSignup && <Field icon={<UserRound />} label="Name"><input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" /></Field>}<Field icon={<Mail />} label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" /></Field><Field icon={<LockKeyhole />} label="Password"><span className="relative block"><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></Field>{isSignup && <Field icon={<LockKeyhole />} label="Confirm password"><input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Repeat your password" /></Field>}{!isSignup && <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--violet)]" /> Remember me</label><button type="button" className="text-primary hover:underline">Forgot password?</button></div>}{error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-200">{error}</p>}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">{busy ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}{!busy && <ArrowRight className="size-4" />}</button></form><p className="mt-7 text-center text-sm text-muted-foreground">{isSignup ? 'Already have an account?' : "Don't have an account?"} <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-primary hover:underline">{isSignup ? 'Log in' : 'Create account'}</Link></p></div></section></main>
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><span className="relative block"><span className="pointer-events-none absolute top-3.5 left-3 text-muted-foreground [&_svg]:size-4">{icon}</span><span className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:pr-3 [&_input]:pl-10 [&_input]:text-sm [&_input]:outline-none focus-within:[&_input]:border-primary">{children}</span></span></label> }
