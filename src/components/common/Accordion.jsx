import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Smooth Accordion — grid-template-rows 0fr → 1fr transition, icon 180° rotate
export default function Accordion({ title, meta, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`card overflow-hidden transition-shadow duration-300 ${open ? 'shadow-raised' : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-50/50"
        aria-expanded={open}
      >
        <div className="min-w-0">{title}</div>
        <div className="flex shrink-0 items-center gap-3">
          {meta}
          <ChevronDown className={`h-5 w-5 text-ink-400 transition-transform duration-300 ${open ? 'rotate-180 text-brand-600' : ''}`} />
        </div>
      </button>
      <div className="accordion-body" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="border-t border-cream-200 px-5 py-4">{open && children}</div>
        </div>
      </div>
    </div>
  )
}
