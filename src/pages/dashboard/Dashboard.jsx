import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Gauge, Zap, UtilityPole, Camera, Lightbulb, Timer, ArrowRight, ShieldAlert, Target, Cable } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import ErrorState from '../../components/common/ErrorState'
import { useGetSummaryQuery } from '../../services/api'
import { selectUser } from '../../features/auth/authSlice'
import { WARDS, FLAG_INFO, isWardScoped } from '../../utils/constants'
import { fmtNum } from '../../utils/format'

// recharts (~100KB gz) वेगळ्या chunk मध्ये — stat cards आधी दिसतात, charts नंतर
const DashboardCharts = lazy(() => import('./DashboardCharts'))

const ChartSkeleton = () => (
  <div className="grid gap-5 xl:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className={`card h-80 animate-pulse bg-cream-150/70 ${i === 0 ? 'xl:col-span-2' : ''}`} />
    ))}
  </div>
)

export default function Dashboard() {
  const user = useSelector(selectUser)
  const [ward, setWard] = useState('')
  const { data, isLoading, isFetching, error, refetch } = useGetSummaryQuery(ward ? { ward } : {})

  const cards = useMemo(() => {
    if (!data) return []
    const m = data.meters
    const p = data.poles
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
    const cov = data.coverage || {}
    const cableTotal = Object.entries(p.byCable || {}).filter(([k]) => k !== 'Not recorded').reduce((a, [, v]) => a + v, 0)
    return [
      { icon: Gauge, title: 'Total Meters', value: fmtNum(m.total), hint: `${fmtNum(m.byPhase['Three Phase'] || 0)} three-phase · ${fmtNum(m.byPhase['Single Phase'] || 0)} single`, tone: 'green' },
      { icon: Target, title: 'Survey Coverage', value: `${cov.percent ?? 0}%`, hint: `${fmtNum(cov.surveyed || 0)} of ${fmtNum(cov.master || 0)} listed consumers`, tone: 'gold', to: '/coverage' },
      { icon: UtilityPole, title: 'Poles Surveyed', value: fmtNum(p.total), hint: `${fmtNum(p.withoutLocation)} without GPS`, tone: 'green', to: '/poles' },
      { icon: Lightbulb, title: 'Light Fittings', value: fmtNum(p.lights), hint: 'Implausible counts excluded', tone: 'gold' },
      { icon: Zap, title: 'Sanctioned Load', value: `${fmtNum(m.totalSanctionLoadKw)} kW`, hint: `Recorded for ${fmtNum(m.withLoadData)} meters`, tone: 'info' },
      { icon: Timer, title: 'Timer Panels', value: fmtNum(m.withTimerPanel), hint: `${pct(m.withTimerPanel, m.total)}% of meters`, tone: 'ink' },
      { icon: Cable, title: 'Cable recorded', value: fmtNum(cableTotal), hint: `${fmtNum(p.byCable?.Underground || 0)} underground · ${fmtNum(p.byCable?.Overhead || 0)} overhead`, tone: 'info' },
      { icon: Camera, title: 'Meter Photos', value: fmtNum(m.withPhoto), hint: `${pct(m.withPhoto, m.total)}% photo coverage`, tone: 'ink' },
    ]
  }, [data])

  const flagTotal = useMemo(() => (data ? Object.values(data.dataQuality).reduce((a, b) => a + b, 0) : 0), [data])
  const canPickWard = !isWardScoped(user)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            Live summary from MongoDB {isFetching && !isLoading && <span className="text-ink-400">· refreshing…</span>}
          </span>
        }
        actions={
          canPickWard && (
            <select value={ward} onChange={(e) => setWard(e.target.value)} className="select">
              <option value="">All wards</option>
              {WARDS.map((w) => <option key={w}>{w}</option>)}
            </select>
          )
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-[104px] animate-pulse bg-cream-150/70" />)
              : cards.map(({ to, ...c }, i) =>
                  to ? (
                    <Link key={c.title} to={to} className="block"><StatCard {...c} delay={i * 50} /></Link>
                  ) : (
                    <StatCard key={c.title} {...c} delay={i * 50} />
                  )
                )}
          </div>

          {data && (
            <Suspense fallback={<ChartSkeleton />}>
              <DashboardCharts data={data} />
            </Suspense>
          )}

          {data && flagTotal > 0 && (
            <Link
              to="/data-quality"
              className="card card-hover group flex items-center justify-between gap-4 border-gold-300/50 bg-gradient-to-r from-gold-50 to-white p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold text-ink-900">Data quality review</div>
                  <div className="text-xs text-ink-500">
                    {Object.entries(data.dataQuality)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([k, v]) => `${fmtNum(v)} ${FLAG_INFO[k]?.label.toLowerCase() || k}`)
                      .join(' · ')}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gold-600 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          )}
        </>
      )}
    </div>
  )
}
