import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Accordion from '../../components/common/Accordion'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import { useGetMetersQuery, useGetSummaryQuery } from '../../services/api'
import { FLAG_INFO } from '../../utils/constants'
import { fmtNum } from '../../utils/format'

// Accordion उघडल्यावरच हा component mount होतो → API call फक्त तेव्हाच (lazy data)
function FlaggedMeters({ flag }) {
  const { data, isLoading } = useGetMetersQuery({ flag, includeFlagged: 'true', limit: 50, page: 1, sort: 'ward', order: 'asc' })
  if (isLoading) return <div className="h-20 animate-pulse rounded-xl bg-cream-150" />
  return (
    <div className="space-y-1.5">
      {data?.data.map((m) => (
        <Link
          key={m._id}
          to={`/meters/${m._id}`}
          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-brand-50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <Badge tone="green">{m.ward}</Badge>
            <span className="font-mono text-xs font-semibold text-brand-700">{m.consumerId || '—'}</span>
            <span className="truncate capitalize text-ink-500">{m.address || '—'}</span>
          </span>
          <span className="text-xs text-ink-400 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      ))}
      {data?.total > 50 && (
        <Link to={`/meters?includeFlagged=true`} className="block px-3 pt-2 text-xs font-semibold text-brand-700">
          + {fmtNum(data.total - 50)} more — open in Meters
        </Link>
      )}
    </div>
  )
}

export default function DataQuality() {
  const { data, isLoading, error, refetch } = useGetSummaryQuery({ includeFlagged: 'true' })
  const entries = Object.entries(data?.dataQuality || {}).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data Quality"
        subtitle="Issues detected automatically while importing the CSV files. Nothing was deleted — records are only flagged."
      />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="card h-16 animate-pulse bg-cream-150/70" />)}</div>
      ) : entries.length === 0 ? (
        <div className="card"><EmptyState icon={ShieldCheck} title="All clean" message="No data quality flags on meters." /></div>
      ) : (
        <div className="space-y-3">
          {entries.map(([flag, count], i) => (
            <div key={flag} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Accordion
                title={
                  <div>
                    <div className="font-display text-sm font-semibold text-ink-900">{FLAG_INFO[flag]?.label || flag}</div>
                    <div className="text-xs text-ink-500">{FLAG_INFO[flag]?.desc}</div>
                  </div>
                }
                meta={<Badge tone={FLAG_INFO[flag]?.tone}>{fmtNum(count)} {count === 1 ? 'meter' : 'meters'}</Badge>}
              >
                <FlaggedMeters flag={flag} />
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
