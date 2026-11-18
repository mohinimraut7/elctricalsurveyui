import { memo, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import PageHeader from '../../components/common/PageHeader'
import ErrorState from '../../components/common/ErrorState'
import { useGetMeterMapQuery, useGetPoleMapQuery } from '../../services/api'
import { PURPOSE_COLORS } from '../../utils/tones'
import { selectUser } from '../../features/auth/authSlice'
import { fileUrl, PURPOSES, WARDS, isWardScoped } from '../../utils/constants'
import { fmtNum } from '../../utils/format'

const COLORS = PURPOSE_COLORS
const CENTER = [19.405, 72.83]

// Markers memo — filter बदलला नाही तर 500+ markers पुन्हा बनत नाहीत
const Markers = memo(function Markers({ points }) {
  return points.map((p) => (
    <CircleMarker
      key={p.id}
      center={[p.lat, p.lng]}
      radius={6}
      pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: COLORS[p.purpose] || '#00843C', fillOpacity: 0.9 }}
    >
      <Popup>
        <div className="w-52">
          {p.thumb && <img src={fileUrl(p.thumb)} alt="" loading="lazy" className="mb-2 h-28 w-full rounded-lg object-cover" />}
          <div className="font-mono text-xs font-semibold text-brand-700">{p.consumerId}</div>
          <div className="text-xs capitalize text-ink-700">{p.address || '—'}</div>
          <div className="mt-1 text-[11px] text-ink-400">{p.ward} · {p.purpose} · {p.phaseType}</div>
          <Link to={`/meters/${p.id}`} className="mt-2 inline-block text-xs font-semibold text-brand-700">View details →</Link>
        </div>
      </Popup>
    </CircleMarker>
  ))
})

// ── 7,000+ poles: React component प्रति marker नको — एकच Leaflet layerGroup, canvas renderer ──
function PoleLayer({ points }) {
  const map = useMap()
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.3 })
    const group = L.layerGroup()
    points.forEach(([lat, lng, pole, light, consumerId]) => {
      L.circleMarker([lat, lng], { renderer, radius: 2.5, weight: 0, fillColor: '#C09C24', fillOpacity: 0.85 })
        .bindTooltip(`${pole} · ${light}<br/><span style="font-family:monospace">${consumerId}</span>`)
        .addTo(group)
    })
    group.addTo(map)
    return () => group.remove()
  }, [map, points])
  return null
}

export default function MapView() {
  const user = useSelector(selectUser)
  const [ward, setWard] = useState('')
  const [purpose, setPurpose] = useState('')
  const [showPoles, setShowPoles] = useState(false)
  // poles फक्त toggle on केल्यावरच fetch (skip) — default map हलका
  const { data: polePoints = [], isFetching: polesLoading } = useGetPoleMapQuery(ward ? { ward } : {}, { skip: !showPoles })
  // server वरून सर्व points एकदाच (lightweight fields only), filter client-side → instant
  const { data = [], isLoading, error, refetch } = useGetMeterMapQuery({})

  const points = useMemo(
    () => data.filter((p) => (!ward || p.ward === ward) && (!purpose || p.purpose === purpose)),
    [data, ward, purpose]
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Map View"
        subtitle={
          isLoading
            ? 'Loading meters…'
            : `${fmtNum(points.length)} meters${showPoles ? (polesLoading ? ' · loading poles…' : ` · ${fmtNum(polePoints.length)} poles`) : ''} on map`
        }
        actions={
          <>
            {!isWardScoped(user) && (
              <select className="select" value={ward} onChange={(e) => setWard(e.target.value)}>
                <option value="">All wards</option>
                {WARDS.map((w) => <option key={w}>{w}</option>)}
              </select>
            )}
            <select className="select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="">All purposes</option>
              {PURPOSES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300">
              <input type="checkbox" className="accent-brand-600" checked={showPoles} onChange={(e) => setShowPoles(e.target.checked)} />
              Show poles
            </label>
          </>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="card relative h-[calc(100dvh-15rem)] min-h-[420px] overflow-hidden rounded-3xl">
          <MapContainer center={CENTER} zoom={12} preferCanvas className="h-full w-full">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {showPoles && polePoints.length > 0 && <PoleLayer points={polePoints} />}
            <Markers points={points} />
          </MapContainer>
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-wrap gap-3 rounded-2xl border border-cream-200 bg-white/90 px-4 py-2.5 text-xs shadow-raised backdrop-blur">
            {showPoles && (
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> Pole</span>
            )}
            {Object.entries(COLORS).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /> {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
