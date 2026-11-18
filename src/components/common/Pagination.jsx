import { memo, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZES } from '../../utils/constants'
import { fmtNum } from '../../utils/format'

function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const out = []
  list.forEach((p, i) => {
    if (i && p - list[i - 1] > 1) out.push('…' + p)
    out.push(p)
  })
  return out
}

function Pagination({ page, totalPages, total, limit, onPage, onLimit, onHoverPage }) {
  const pages = useMemo(() => pageWindow(page, totalPages || 1), [page, totalPages])
  const from = total ? (page - 1) * limit + 1 : 0
  const to = Math.min(page * limit, total)

  const btn =
    'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors duration-200 disabled:opacity-40'

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-cream-200 px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-3 text-xs text-ink-500">
        <span>
          Showing <b className="text-ink-800">{fmtNum(from)}–{fmtNum(to)}</b> of <b className="text-ink-800">{fmtNum(total)}</b>
        </span>
        <select value={limit} onChange={(e) => onLimit(Number(e.target.value))} className="select h-8">
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          className={`${btn} text-ink-600 hover:bg-brand-50 hover:text-brand-700`}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1 text-xs text-ink-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              onMouseEnter={() => onHoverPage?.(p)}
              className={`${btn} ${p === page ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-brand' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700'}`}
            >
              {p}
            </button>
          )
        )}
        <button
          className={`${btn} text-ink-600 hover:bg-brand-50 hover:text-brand-700`}
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          onMouseEnter={() => onHoverPage?.(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default memo(Pagination)
