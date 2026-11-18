export default function PageLoader({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'min-h-dvh' : 'min-h-[50vh]'}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500" />
        <span className="text-xs font-medium text-ink-400">Loading…</span>
      </div>
    </div>
  )
}
