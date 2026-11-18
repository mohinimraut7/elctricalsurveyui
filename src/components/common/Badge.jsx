import { memo } from 'react'

const tones = {
  green: 'border-brand-200 bg-brand-50 text-brand-700',
  gold: 'border-gold-300/60 bg-gold-50 text-gold-600',
  ink: 'border-cream-300 bg-cream-150 text-ink-700',
  bad: 'border-[#efc9c5] bg-[#fbefee] text-status-bad',
  warn: 'border-[#ecd7ad] bg-[#fbf4e6] text-status-warn',
  info: 'border-[#c7dde3] bg-[#eef5f7] text-status-info',
}

function Badge({ children, tone = 'ink', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export default memo(Badge)
