import { memo } from 'react'

const tones = {
  green: 'bg-brand-100 text-brand-700',
  gold: 'bg-gold-100 text-gold-600',
  ink: 'bg-cream-200 text-ink-700',
  info: 'bg-[#e6f0f2] text-status-info',
}

function StatCard({ icon: Icon, title, value, hint, tone = 'green', delay = 0 }) {
  return (
    <div
      className="card card-hover flex animate-slide-up items-start gap-4 p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block text-xs font-medium text-ink-500">{title}</span>
        <div className="font-display text-2xl font-bold tracking-tight text-ink-900 lg:text-[1.7rem]">{value}</div>
        {hint && <div className="mt-0.5 truncate text-xs text-ink-400">{hint}</div>}
      </div>
    </div>
  )
}

export default memo(StatCard)
