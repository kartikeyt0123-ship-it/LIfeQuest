import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-pretty text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
