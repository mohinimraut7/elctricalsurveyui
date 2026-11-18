import { memo, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import useDebounce from '../../hooks/useDebounce'
import { WARDS, PURPOSES, PHASE_TYPES } from '../../utils/constants'

function MeterFilters({ params, update, showWard }) {
  const [q, setQ] = useState(params.search)
  const debounced = useDebounce(q)

  useEffect(() => {
    if (debounced !== params.search) update({ search: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // URL बदलला (उदा. reset) तर input sync
  useEffect(() => setQ(params.search), [params.search])

  const active = params.search || params.ward || params.purpose || params.phaseType || params.hasImage || params.hasPoles || params.includeFlagged

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search address, Consumer ID, meter no…"
          className="input pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {showWard && (
          <select className="select" value={params.ward} onChange={(e) => update({ ward: e.target.value })}>
            <option value="">All wards</option>
            {WARDS.map((w) => <option key={w}>{w}</option>)}
          </select>
        )}
        <select className="select" value={params.purpose} onChange={(e) => update({ purpose: e.target.value })}>
          <option value="">All purposes</option>
          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="select" value={params.phaseType} onChange={(e) => update({ phaseType: e.target.value })}>
          <option value="">All phases</option>
          {PHASE_TYPES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="select" value={params.hasImage} onChange={(e) => update({ hasImage: e.target.value })}>
          <option value="">Photo: any</option>
          <option value="true">With photo</option>
          <option value="false">Without photo</option>
        </select>
        <select className="select" value={params.hasPoles} onChange={(e) => update({ hasPoles: e.target.value })}>
          <option value="">Poles: any</option>
          <option value="true">With poles</option>
          <option value="false">No poles yet</option>
        </select>
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300">
          <input
            type="checkbox"
            className="accent-brand-600"
            checked={params.includeFlagged === 'true'}
            onChange={(e) => update({ includeFlagged: e.target.checked ? 'true' : '' })}
          />
          Show test entries
        </label>
        {active && (
          <button
            className="btn-ghost h-10"
            onClick={() => {
              setQ('')
              update({ search: '', ward: '', purpose: '', phaseType: '', hasImage: '', hasPoles: '', includeFlagged: '' })
            }}
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(MeterFilters)
