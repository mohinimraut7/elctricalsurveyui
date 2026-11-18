import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, ExternalLink, MapPin, Pencil, Save, X, Loader2, UtilityPole, Camera } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import PageLoader from '../../components/common/PageLoader'
import ErrorState from '../../components/common/ErrorState'
import LazyImage from '../../components/common/LazyImage'
import EmptyState from '../../components/common/EmptyState'
import DataTable from '../../components/common/DataTable'
import Badge from '../../components/common/Badge'
import { purposeTone } from '../../utils/tones'
import { useGetMeterQuery, useUpdateMeterMutation } from '../../services/api'
import { selectUser } from '../../features/auth/authSlice'
import { fileUrl, FLAG_INFO, PURPOSES, ROLES } from '../../utils/constants'
import { errMsg, fmtDateTime, latLng, mapsLink } from '../../utils/format'

const MiniMap = lazy(() => import('../../components/map/MiniMap'))

const POLE_STEP = 25

function LinkedPoles({ poles }) {
  const [shown, setShown] = useState(POLE_STEP)
  const columns = useMemo(
    () => [
      { key: 'photo', header: '', className: 'w-14', render: (p) => <LazyImage src={fileUrl(p.poleThumbUrl)} zoom className="h-10 w-10 rounded-lg" /> },
      {
        key: 'pole',
        header: 'Pole',
        render: (p) => (
          <div>
            <div className="font-medium text-ink-900">{p.pole.name}</div>
            <div className="text-[11px] text-ink-400">{p.pole.height}{p.pole.bracket && ` · ${p.pole.bracket}`}</div>
          </div>
        ),
      },
      { key: 'light', header: 'Light', render: (p) => <Badge tone="gold">{p.light.name} · {p.light.watts}</Badge> },
      { key: 'n', header: 'Lights', align: 'right', render: (p) => <span className="tabular-nums">{p.numberOfLights ?? '—'}</span> },
      {
        key: 'cable',
        header: 'Cable',
        render: (p) => (p.cable?.type ? <span className="whitespace-nowrap text-xs">{p.cable.type} · {p.cable.material} {p.cable.size}</span> : <span className="text-xs text-ink-300">—</span>),
      },
      {
        key: 'flags',
        header: 'Flags',
        render: (p) => (
          <div className="flex flex-wrap gap-1">
            {p.dataFlags.filter((f) => f !== 'no_matching_meter').map((f) => <Badge key={f} tone={FLAG_INFO[f]?.tone}>{FLAG_INFO[f]?.label || f}</Badge>)}
          </div>
        ),
      },
      { key: 'date', header: 'Surveyed', render: (p) => <span className="whitespace-nowrap text-xs text-ink-500">{fmtDateTime(p.surveyedAt)}</span> },
    ],
    []
  )
  const visible = useMemo(() => poles.slice(0, shown), [poles, shown])

  return (
    <div className="card overflow-hidden rounded-3xl">
      <h3 className="flex items-center gap-2 border-b border-cream-200 px-5 py-4 font-display text-base font-semibold">
        <UtilityPole className="h-5 w-5 text-brand-600" /> Linked poles <span className="text-ink-400">({poles.length})</span>
      </h3>
      {poles.length ? (
        <>
          <DataTable columns={columns} data={visible} />
          {shown < poles.length && (
            <div className="border-t border-cream-200 p-3 text-center">
              <button onClick={() => setShown((n) => n + POLE_STEP)} className="btn-ghost">
                Show {Math.min(POLE_STEP, poles.length - shown)} more of {poles.length - shown}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="px-5 py-4 text-sm text-ink-400">No poles surveyed for this Consumer ID yet.</p>
      )}
    </div>
  )
}

function Info({ label, children }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 transition-colors duration-200 hover:border-brand-200 hover:bg-brand-50/40">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-ink-900">{children ?? '—'}</div>
    </div>
  )
}

function EditForm({ meter, onDone }) {
  const [updateMeter, { isLoading }] = useUpdateMeterMutation()
  const [f, setF] = useState({
    newMeterNumber: meter.newMeterNumber || '',
    purpose: meter.purpose,
    address: meter.address || '',
    sanctionLoadKw: meter.sanctionLoadKw ?? '',
    hasTimerPanel: meter.hasTimerPanel === null ? '' : String(meter.hasTimerPanel),
  })
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await updateMeter({
        id: meter._id,
        newMeterNumber: f.newMeterNumber.trim(),
        purpose: f.purpose,
        address: f.address.trim(),
        sanctionLoadKw: f.sanctionLoadKw === '' ? null : Number(f.sanctionLoadKw),
        hasTimerPanel: f.hasTimerPanel === '' ? null : f.hasTimerPanel === 'true',
      }).unwrap()
      onDone()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <form onSubmit={save} className="card animate-slide-up space-y-4 p-5">
      <h3 className="font-display text-base font-semibold">Edit meter</h3>
      {error && <p className="rounded-lg bg-[#fbefee] px-3 py-2 text-xs text-status-bad">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-700">New meter no.<input className="input mt-1" value={f.newMeterNumber} onChange={set('newMeterNumber')} /></label>
        <label className="text-xs font-semibold text-ink-700">Purpose
          <select className="select mt-1 w-full" value={f.purpose} onChange={set('purpose')}>
            {PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-700 sm:col-span-2">Address<input className="input mt-1" value={f.address} onChange={set('address')} /></label>
        <label className="text-xs font-semibold text-ink-700">Sanction load (kW)<input type="number" step="0.01" min="0" className="input mt-1" value={f.sanctionLoadKw} onChange={set('sanctionLoadKw')} /></label>
        <label className="text-xs font-semibold text-ink-700">Timer panel
          <select className="select mt-1 w-full" value={f.hasTimerPanel} onChange={set('hasTimerPanel')}>
            <option value="">Not recorded</option><option value="true">Yes</option><option value="false">No</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost"><X className="h-3.5 w-3.5" /> Cancel</button>
        <button disabled={isLoading} className="btn-primary">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
      </div>
    </form>
  )
}

export default function MeterDetail() {
  const { id } = useParams()
  const user = useSelector(selectUser)
  const { data: m, isLoading, error, refetch } = useGetMeterQuery(id)
  const [editing, setEditing] = useState(false)
  const center = useMemo(() => {
    const p = latLng(m)
    return p ? [p.lat, p.lng] : null
  }, [m])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const canEdit = user?.role === ROLES.SUPER_ADMIN || (user?.role === ROLES.WARD_ENGINEER && user.ward === m.ward)  // surveyor = read-only
  const flags = m.dataFlags || []

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={
          <Link to="/meters" className="group inline-flex items-center gap-1 transition-colors hover:text-brand-700">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Meters
          </Link>
        }
        title={<span className="font-mono">{m.consumerId || 'No Consumer ID'}</span>}
        subtitle={<span className="capitalize">{m.address || 'Address not recorded'}</span>}
        actions={
          <>
            <a href={mapsLink(m)} target="_blank" rel="noreferrer" className="btn-ghost h-10">
              <MapPin className="h-3.5 w-3.5" /> Google Maps <ExternalLink className="h-3 w-3" />
            </a>
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} className="btn-primary"><Pencil className="h-4 w-4" /> Edit</button>
            )}
          </>
        }
      />

      {editing && <EditForm meter={m} onDone={() => setEditing(false)} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Photo */}
        <div className="card self-start overflow-hidden animate-slide-up">
          {m.meterImageUrl ? (
            <a href={fileUrl(m.meterImageUrl)} target="_blank" rel="noreferrer" title="Open full photo">
              <LazyImage src={fileUrl(m.meterImageUrl)} alt="Meter" zoom className="aspect-[4/5] w-full" />
            </a>
          ) : (
            <EmptyState icon={Camera} title="No photo" message={flags.includes('image_not_available') ? `File "${m.meterImageFile}" was not in the uploaded photo data.` : 'Photo not captured during survey.'} />
          )}
        </div>

        <div className="space-y-5">
          <div className="card animate-slide-up p-5" style={{ animationDelay: '80ms' }}>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone="green">{m.ward}</Badge>
              <Badge tone={purposeTone(m.purpose)}>{m.purpose}</Badge>
              <Badge tone="ink">{m.phaseType}</Badge>
              {flags.map((f) => <Badge key={f} tone={FLAG_INFO[f]?.tone}>{FLAG_INFO[f]?.label || f}</Badge>)}
              {m.poleCount > 0 && <Badge tone="green">{m.poleCount} poles</Badge>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Consumer ID"><span className="font-mono">{m.consumerId || '—'}</span></Info>
              <Info label="New meter no.">{m.newMeterNumber || '—'}</Info>
              <Info label="Sanction load">{m.sanctionLoadKw != null ? `${m.sanctionLoadKw} kW` : '—'}</Info>
              <Info label="Timer panel">{m.hasTimerPanel == null ? '—' : m.hasTimerPanel ? 'Yes' : 'No'}</Info>
              <Info label="Surveyed at">{fmtDateTime(m.surveyedAt)}</Info>
              <Info label="Coordinates"><span className="font-mono text-xs">{center ? `${center[0].toFixed(6)}, ${center[1].toFixed(6)}` : '—'}</span></Info>
            </div>
          </div>

          {center && (
            <div className="card h-72 overflow-hidden animate-slide-up" style={{ animationDelay: '140ms' }}>
              <Suspense fallback={<div className="h-full animate-pulse bg-cream-150" />}>
                <MiniMap center={center} poles={m.poles || []} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Linked poles — एका meter वर 120+ poles असू शकतात → table + "show more" */}
      <LinkedPoles poles={m.poles || []} />
    </div>
  )
}
