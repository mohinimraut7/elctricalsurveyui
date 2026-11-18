import { AlertTriangle, RotateCcw } from 'lucide-react'
import { errMsg } from '../../utils/format'

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbefee] text-status-bad">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm text-ink-700">{errMsg(error)}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost">
          <RotateCcw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  )
}
