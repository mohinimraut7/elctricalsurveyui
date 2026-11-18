export default function PageHeader({ title, subtitle, actions, breadcrumbs }) {
  return (
    <div className="mb-6 flex animate-fade-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs && <div className="mb-1 flex items-center gap-1.5 text-xs text-ink-400">{breadcrumbs}</div>}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-gold-400 to-gold-300" />
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
