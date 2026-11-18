import { useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import ErrorState from '../../components/common/ErrorState'
import LazyImage from '../../components/common/LazyImage'
import Badge from '../../components/common/Badge'
import useQueryParams from '../../hooks/useQueryParams'
import { useGetPolesQuery, usePrefetch } from '../../services/api'
import { selectUser } from '../../features/auth/authSlice'
import { fileUrl, FLAG_INFO, LIGHT_TYPES, POLE_TYPES, CABLE_TYPES, WARDS, isWardScoped } from '../../utils/constants'
import { fmtDateTime, fmtNum } from '../../utils/format'

const DEFAULTS = { page: 1, limit: 20, ward: '', poleType: '', lightType: '', cableType: '', flag: '', includeFlagged: '' }

export default function PoleList() {
  const user = useSelector(selectUser)
  const [params, update] = useQueryParams(DEFAULTS)
  const { data, isLoading, isFetching, error, refetch } = useGetPolesQuery(params)
  const prefetch = usePrefetch('getPoles', { ifOlderThan: 60 })

  useEffect(() => {
    if (data && params.page < data.totalPages) prefetch({ ...params, page: params.page + 1 })
  }, [data, params, prefetch])

  const onPage = useCallback((page) => update({ page }, { resetPage: false }), [update])
  const onLimit = useCallback((limit) => update({ limit }), [update])

  const columns = useMemo(
    () => [
      { key: 'photo', header: '', className: 'w-14', render: (r) => <LazyImage src={fileUrl(r.poleThumbUrl)} zoom className="h-10 w-10 rounded-lg" /> },
      {
        key: 'pole',
        header: 'Pole',
        render: (r) => (
          <div>
            <div className="font-medium text-ink-900">{r.pole.name}</div>
            <div className="text-[11px] text-ink-400">{r.pole.height}{r.pole.bracketType && ` · ${r.pole.bracketType}`}</div>
          </div>
        ),
      },
      { key: 'bracket', header: 'Bracket', render: (r) => <span className="whitespace-nowrap text-xs">{r.pole.bracket || '—'}</span> },
      { key: 'light', header: 'Light', render: (r) => <Badge tone="gold">{r.light.name}</Badge> },
      { key: 'watts', header: 'Watts', render: (r) => <span className="whitespace-nowrap text-xs">{r.light.watts}</span> },
      { key: 'numberOfLights', header: 'Lights', align: 'right', render: (r) => <span className="tabular-nums">{r.numberOfLights ?? '—'}</span> },
      {
        key: 'cable',
        header: 'Cable',
        render: (r) =>
          r.cable?.type ? (
            <div className="whitespace-nowrap text-xs">
              <div className="font-medium text-ink-800">{r.cable.type}</div>
              <div className="text-[11px] text-ink-400">{r.cable.material} · {r.cable.size}</div>
            </div>
          ) : (
            <span className="text-xs text-ink-300">—</span>
          ),
      },
      { key: 'ward', header: 'Ward', render: (r) => <Badge tone="green">{r.ward}</Badge> },
      {
        key: 'consumerId',
        header: 'Meter (Consumer ID)',
        render: (r) =>
          r.meter ? (
            <Link to={`/meters/${r.meter._id}`} className="group font-mono text-[13px] font-semibold text-brand-700 hover:text-gold-600">
              {r.consumerId}
              <span className="block max-w-[200px] truncate font-sans text-[11px] font-normal capitalize text-ink-400">{r.meter.address}</span>
            </Link>
          ) : (
            <span className="font-mono text-[13px] text-ink-500">{r.consumerId}</span>
          ),
      },
      {
        key: 'flags',
        header: 'Flags',
        render: (r) => (
          <div className="flex flex-wrap gap-1">
            {r.dataFlags.slice(0, 2).map((f) => <Badge key={f} tone={FLAG_INFO[f]?.tone}>{FLAG_INFO[f]?.label || f}</Badge>)}
          </div>
        ),
      },
      { key: 'surveyedAt', header: 'Surveyed', render: (r) => <span className="whitespace-nowrap text-xs text-ink-500">{fmtDateTime(r.surveyedAt)}</span> },
    ],
    []
  )

  return (
    <div className="space-y-5">
      <PageHeader title="Poles & Lights" subtitle={data ? `${fmtNum(data.total)} poles match the current filters` : 'Pole and light fitting survey'} />

      <div className="card flex flex-wrap items-center gap-2.5 p-4">
        {!isWardScoped(user) && (
          <select className="select" value={params.ward} onChange={(e) => update({ ward: e.target.value })}>
            <option value="">All wards</option>
            {WARDS.map((w) => <option key={w}>{w}</option>)}
          </select>
        )}
        <select className="select" value={params.poleType} onChange={(e) => update({ poleType: e.target.value })}>
          <option value="">All pole types</option>
          {POLE_TYPES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="select" value={params.lightType} onChange={(e) => update({ lightType: e.target.value })}>
          <option value="">All light types</option>
          {LIGHT_TYPES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="select" value={params.cableType} onChange={(e) => update({ cableType: e.target.value })}>
          <option value="">All cables</option>
          {CABLE_TYPES.map((c) => <option key={c}>{c}</option>)}
          <option value="none">Not recorded</option>
        </select>
        <select className="select" value={params.flag} onChange={(e) => update({ flag: e.target.value })}>
          <option value="">Any status</option>
          {['missing_location', 'suspicious_light_count', 'no_matching_meter', 'out_of_area'].map((f) => (
            <option key={f} value={f}>{FLAG_INFO[f].label}</option>
          ))}
        </select>
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300">
          <input type="checkbox" className="accent-brand-600" checked={params.includeFlagged === 'true'} onChange={(e) => update({ includeFlagged: e.target.checked ? 'true' : '' })} />
          Show test entries
        </label>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="card overflow-hidden rounded-3xl">
          <DataTable columns={columns} data={data?.data || []} loading={isLoading} fetching={isFetching} emptyMessage="No poles found" />
          {data && data.total > 0 && (
            <Pagination page={params.page} totalPages={data.totalPages} total={data.total} limit={params.limit} onPage={onPage} onLimit={onLimit} />
          )}
        </div>
      )}
    </div>
  )
}
