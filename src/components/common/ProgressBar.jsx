import { memo } from 'react'

// soft green → gold gradient bar, width transition (color + width smooth)
function ProgressBar({ value = 0, className = '' }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-cream-200 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-[width] duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

export default memo(ProgressBar)
