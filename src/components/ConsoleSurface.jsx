import React from 'react';
import { ArrowRight } from 'lucide-react';

const toneStyles = {
  brand: 'border-brand-500/20 bg-brand-500/10 text-brand-500',
  cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-500',
  sky: 'border-sky-500/20 bg-sky-500/10 text-sky-500',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-500',
  slate: 'border-page-divider bg-page-surface text-page-secondary',
};

export function ConsolePage({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function ConsoleHero({
  eyebrow,
  title,
  subtitle,
  actions,
  stats,
  footer,
  className = '',
}) {
  return (
    <section className={`glass relative overflow-hidden border border-page-divider p-4 shadow-sm sm:p-6 lg:p-8 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),rgba(99,102,241,0.04),transparent)]" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 break-words text-2xl font-heading font-semibold text-page sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-page-secondary sm:text-base">
              {subtitle}
            </p>
          )}
          {actions && <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">{actions}</div>}
        </div>
        {stats && stats.length > 0 && (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {stats}
          </div>
        )}
      </div>
      {footer && <div className="relative mt-6">{footer}</div>}
    </section>
  );
}

export function ConsoleStat({ icon: Icon, label, value, helper, tone = 'brand' }) {
  const toneClass = toneStyles[tone] || toneStyles.brand;

  return (
    <div className="rounded-2xl border border-page-divider bg-page-surface/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-page-muted">
            {label}
          </p>
          <div className="mt-2 break-words text-xl font-semibold tracking-tight text-page sm:text-2xl">
            {value}
          </div>
          {helper && <p className="mt-1 text-xs leading-5 text-page-secondary">{helper}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsoleSection({
  title,
  subtitle,
  action,
  children,
  className = '',
}) {
  return (
    <section className={`glass border border-page-divider p-5 shadow-sm sm:p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-page sm:text-lg">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm leading-6 text-page-secondary">{subtitle}</p>}
          </div>
          {action && <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function ConsoleEmpty({
  icon: Icon = ArrowRight,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-page-divider bg-page-surface/40 px-4 py-10 text-center sm:px-6 sm:py-14 ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-page-divider bg-page-surface text-page-muted">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-page">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-page-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConsoleBadge({ tone = 'slate', children, className = '' }) {
  const toneClass = toneStyles[tone] || toneStyles.slate;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass} ${className}`}>
      {children}
    </span>
  );
}
