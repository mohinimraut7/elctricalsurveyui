import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Download, Eye, Loader2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Pagination from '../../components/common/Pagination'
import ErrorState from '../../components/common/ErrorState'
import LazyImage from '../../components/common/LazyImage'
import Badge from '../../components/common/Badge'
import { purposeTone } from '../../utils/tones'
import MeterFilters from './MeterFilters'
import useQueryParams from '../../hooks/useQueryParams'
import { useGetMetersQuery, usePrefetch, downloadMetersExcel } from '../../services/api'
import { selectToken, selectUser } from '../../features/auth/authSlice'
import { fileUrl, FLAG_INFO, isWardScoped } from '../../utils/constants'
import { fmtDateTime, fmtNum } from '../../utils/format'
import { MeterDetail } from '../../routes/lazyPages'

const DEFAULTS = {
  page: 1, limit: 20, sort: 'surveyedAt', order: 'desc',
  search: '', ward: '', purpose: '', phaseType: '', hasImage: '', hasPoles: '', includeFlagged: '',
}

export default function MeterList() {
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const [params, update] = useQueryParams(DEFAULTS)
  const [exporting, setExporting] = useState(false)

  // server-side pagination — फक्त current page चे rows येतात
  const { data, isLoading, isFetching, error, refetch } = useGetMetersQuery(params)
  const prefetchMeters = usePrefetch('getMeters', { ifOlderThan: 60 })

  // पुढचं page background मध्ये आधीच आणून ठेवा → "Next" click instant
  useEffect(() => {
    if (data && params.page < data.totalPages) prefetchMeters({ ...params, page: params.page + 1 })
  }, [data, params, prefetchMeters])

  const onHoverPage = useCallback((p) => prefetchMeters({ ...params, page: p }), [params, prefetchMeters])
  const onPage = useCallback((page) => {
    update({ page }, { resetPage: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [update])
  const onLimit = useCallback((limit) => update({ limit }), [update])
  const onSort = useCallback((sort, order) => update({ sort, order }), [update])
  const onRowClick = useCallback((row) => navigate(`/meters/${row._id}`), [navigate])

  // columns memoized — प्रत्येक render ला नवीन array नको (DataTable rows memo टिकतात)
  const columns = useMemo(
    () => [
      {
        key: 'photo',
        header: '',
        className: 'w-14',
        render: (r) => <LazyImage src={fileUrl(r.meterThumbUrl)} alt="" zoom className="h-10 w-10 rounded-lg" />,
      },
      {
        key: 'consumerId',
        header: 'Consumer ID',
        sortable: true,
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-mono text-[13px] font-semibold tracking-tight text-brand-700">{r.consumerId || '—'}</span>
            {r.newMeterNumber && <span className="text-[11px] text-ink-400">New: {r.newMeterNumber}</span>}
          </div>
        ),
      },
      { key: 'ward', header: 'Ward', sortable: true, render: (r) => <Badge tone="green">{r.ward}</Badge> },
      {
        key: 'address',
        header: 'Address',
        sortable: true,
        render: (r) => <span className="block max-w-[260px] truncate capitalize" title={r.address}>{r.address || '—'}</span>,
      },
      { key: 'purpose', header: 'Purpose', render: (r) => <Badge tone={purposeTone(r.purpose)}>{r.purpose}</Badge> },
      { key: 'phaseType', header: 'Phase', render: (r) => <span className="whitespace-nowrap text-xs text-ink-700">{r.phaseType}</span> },
      {
        key: 'sanctionLoadKw',
        header: 'Load (kW)',
        sortable: true,
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.sanctionLoadKw ?? '—'}</span>,
      },
      {
        key: 'poleCount',
        header: 'Poles',
        sortable: true,
        align: 'right',
        render: (r) => <span className={`tabular-nums ${r.poleCount ? 'font-semibold text-brand-700' : 'text-ink-300'}`}>{r.poleCount || 0}</span>,
      },
      {
        key: 'surveyedAt',
        header: 'Surveyed',
        sortable: true,
        render: (r) => <span className="whitespace-nowrap text-xs text-ink-500">{fmtDateTime(r.surveyedAt)}</span>,
      },
      {
        key: 'flags',
        header: 'Flags',
        render: (r) => (
          <div className="flex max-w-[180px] flex-wrap gap-1">
            {r.dataFlags.filter((f) => f !== 'image_not_available' && f !== 'not_in_master_list').slice(0, 2).map((f) => (
              <Badge key={f} tone={FLAG_INFO[f]?.tone}>{FLAG_INFO[f]?.label || f}</Badge>
            ))}
          </div>
        ),
      },
      {
        key: 'action',
        header: '',
        align: 'right',
        render: () => (
          <span
            onMouseEnter={() => MeterDetail.preload()}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </span>
        ),
      },
    ],
    []
  )

  const onExport = async () => {
    setExporting(true)
    try {
      const { page: _p, limit: _l, sort: _s, order: _o, ...filters } = params
      await downloadMetersExcel(filters, token)
    } catch {
      alert('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Meters"
        subtitle={data ? `${fmtNum(data.total)} meters match the current filters` : 'Street-light, garden & smashan bhumi electricity meters'}
        actions={
          <button onClick={onExport} disabled={exporting || !data?.total} className="btn-primary">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Excel
          </button>
        }
      />

      <MeterFilters params={params} update={update} showWard={!isWardScoped(user)} />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="card overflow-hidden rounded-3xl">
          <DataTable
            columns={columns}
            data={data?.data || []}
            loading={isLoading}
            fetching={isFetching}
            sort={params.sort}
            order={params.order}
            onSort={onSort}
            onRowClick={onRowClick}
            emptyMessage="No meters match these filters"
          />
          {data && data.total > 0 && (
            <Pagination
              page={params.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={params.limit}
              onPage={onPage}
              onLimit={onLimit}
              onHoverPage={onHoverPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
