import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Field({ label, icon: Icon, type = 'text', error, ...props }) {
  const [show, setShow] = useState(false)
  const isPwd = type === 'password'
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-700">{label}</span>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          type={isPwd && show ? 'text' : type}
          className={`input h-[46px] rounded-2xl ${Icon ? 'pl-12' : ''} ${isPwd ? 'pr-11' : ''} ${error ? 'border-status-bad/60' : ''}`}
          {...props}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-brand-600"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-[11px] text-status-bad">{error}</span>}
    </label>
  )
}
