import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ClipboardList, CheckCircle2, Clock, Search, ListPlus } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import ErrorState from '../../components/common/ErrorState'
import ProgressBar from '../../components/common/ProgressBar'
import Badge from '../../components/common/Badge'
import useQueryParams from '../../hooks/useQueryParams'
import useDebounce from '../../hooks/useDebounce'
import { useGetCoverageQuery, useGetMasterConsumersQuery, usePrefetch } from '../../services/api'
import { selectUser } from '../../features/auth/authSlice'
import { WARDS, isWardScoped } from '../../utils/constants'
import { fmtDate, fmtNum } from '../../utils/format'

const DEFAULTS = { page: 1, limit: 20, ward: '', status: 'pending', search: '' }
const TABS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'surveyed', label: 'Surveyed', icon: CheckCircle2 },
  { key: '', label: 'All', icon: ClipboardList },
]

export default function Coverage() {
  const user = useSelector(selectUser)
  const [params, update] = useQueryParams(DEFAULTS)
  const [q, setQ] = useState(params.search)
  const debounced = useDebounce(q)
  useEffect(() => {
    if (debounced !== params.search) update({ search: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { data: cov, isLoading: covLoading, error: covError, refetch } = useGetCoverageQuery(params.ward ? { ward: params.ward } : {})
  const { data, isLoading, isFetching, error } = useGetMasterConsumersQuery(params)
  const prefetch = usePrefetch('getMasterConsumers', { ifOlderThan: 60 })
  useEffect(() => {
    if (data && params.page < data.totalPages) prefetch({ ...params, page: params.page + 1 })
  }, [data, params, prefetch])

  const onPage = useCallback((page) => update({ page }, { resetPage: false }), [update])
  const onLimit = useCallback((limit) => update({ limit }), [update])

  const columns = useMemo(
    () => [
      { key: 'consumerId', header: 'Consumer ID', render: (r) => (
          <span className="font-mono text-[13px] font-semibold text-brand-700" title={r.consumerIdRaw !== r.consumerId ? `In list as ${r.consumerIdRaw}` : undefined}>
            {r.consumerIdRaw || r.consumerId}
          </span>
        ),
      },
      { key: 'ward', header: 'Ward', render: (r) => <Badge tone="green">{r.ward}</Badge> },
      {
        key: 'status',
        header: 'Status',
        render: (r) => (r.meter ? <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Surveyed</Badge> : <Badge tone="warn"><Clock className="h-3 w-3" /> Pending</Badge>),
      },
      {
        key: 'meter',
        header: 'Surveyed meter',
        render: (r) =>
          r.meter ? (
            <Link to={`/meters/${r.meter._id}`} className="group block max-w-[280px]">
              <span className="block truncate capitalize text-ink-800 transition-colors group-hover:text-brand-700">{r.meter.address || '—'}</span>
              <span className="text-[11px] text-ink-400">{fmtDate(r.meter.surveyedAt)} · {r.meter.poleCount || 0} poles</span>
            </Link>
          ) : (
            <span className="text-xs text-ink-400">Not surveyed yet</span>
          ),
      },
    ],
    []
  )

  const t = cov?.totals

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Coverage"
        subtitle="Ward consumer list (old app master data) vs meters actually surveyed. IDs matched without leading zeros; junk IDs excluded."
        actions={
          !isWardScoped(user) && (
            <select className="select" value={params.ward} onChange={(e) => update({ ward: e.target.value })}>
              <option value="">All wards</option>
              {WARDS.map((w) => <option key={w}>{w}</option>)}
            </select>
          )
        }
      />

      {covError ? (
        <ErrorState error={covError} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {covLoading || !t ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-[104px] animate-pulse bg-cream-150/70" />)
            ) : (
              <>
                <StatCard icon={ClipboardList} title="Listed consumers" value={fmtNum(t.master)} hint="Ward lists, junk IDs excluded" tone="ink" />
                <StatCard icon={CheckCircle2} title="Surveyed" value={fmtNum(t.surveyed)} hint={`${t.percent}% coverage`} tone="green" delay={60} />
                <StatCard icon={Clock} title="Pending survey" value={fmtNum(t.pending)} hint="In master list, no meter yet" tone="gold" delay={120} />
                <StatCard icon={ListPlus} title="Surveyed, not in list" value={fmtNum(t.notInMaster)} hint="New / mistyped Consumer IDs" tone="info" delay={180} />
              </>
            )}
          </div>

          {/* Ward-wise progress */}
          <div className="card animate-slide-up overflow-hidden rounded-3xl">
            <div className="border-b border-cream-200 px-5 py-4">
              <h3 className="font-display text-base font-semibold">Ward-wise progress</h3>
            </div>
            <div className="divide-y divide-cream-200/70">
              {cov?.wards.map((w) => (
                <button
                  key={w.ward}
                  onClick={() => !isWardScoped(user) && update({ ward: params.ward === w.ward ? '' : w.ward })}
                  className={`grid w-full grid-cols-[80px_1fr] items-center gap-4 px-5 py-3 text-left transition-colors duration-200 hover:bg-brand-50/50 sm:grid-cols-[90px_1fr_320px] ${params.ward === w.ward ? 'bg-brand-50/70' : ''}`}
                >
                  <Badge tone="green" className="w-fit">{w.ward}</Badge>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={w.percent} />
                    <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-700">{w.percent}%</span>
                  </div>
                  <div className="col-span-2 flex gap-4 whitespace-nowrap text-xs text-ink-500 sm:col-span-1 sm:justify-end">
                    <span><b className="text-ink-800">{fmtNum(w.surveyed)}</b> / {fmtNum(w.master)} surveyed</span>
                    <span className="text-gold-600">{fmtNum(w.pending)} pending</span>
                    {w.notInMaster > 0 && <span className="text-status-info">+{w.notInMaster} extra</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Consumer list */}
      <div className="card overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 p-4">
          <div className="flex gap-1 rounded-xl bg-cream-150 p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => update({ status: key })}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  params.status === key ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-brand-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Consumer ID…" className="input pl-10" />
          </div>
        </div>
        {error ? (
          <div className="p-4"><ErrorState error={error} /></div>
        ) : (
          <>
            <DataTable columns={columns} data={data?.data || []} loading={isLoading} fetching={isFetching} emptyMessage="No consumers in this view" />
            {data && data.total > 0 && (
              <Pagination page={params.page} totalPages={data.totalPages} total={data.total} limit={params.limit} onPage={onPage} onLimit={onLimit} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
