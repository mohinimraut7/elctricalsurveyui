import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here', message, action }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <Icon className="h-7 w-7" strokeWidth={1.6} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
