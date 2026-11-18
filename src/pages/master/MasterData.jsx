import { memo } from 'react'
import { Lightbulb, UtilityPole, Cable, Tags, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import { useGetMasterDataQuery } from '../../services/api'

const Chips = memo(function Chips({ items, tone = 'ink' }) {
  if (!items?.length) return <span className="text-xs text-ink-400">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => <Badge key={x} tone={tone}>{x}</Badge>)}
    </div>
  )
})

function Section({ icon: Icon, title, children, delay = 0 }) {
  return (
    <div className="card card-hover animate-slide-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Icon className="h-4.5 w-4.5" /></span>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function MasterData() {
  const { data, isLoading, error, refetch } = useGetMasterDataQuery()

  if (error) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="space-y-5">
      <PageHeader title="Master Data" subtitle="Survey app dropdown catalogue (from VVCM staticdatas)" />

      {data?.fallback && (
        <div className="flex items-start gap-2 rounded-xl border border-gold-300/60 bg-gold-50 px-4 py-3 text-xs text-gold-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Master data अजून import झालेला नाही — default list दाखवत आहे. Backend मध्ये <code>npm run import:data</code> चालवा.
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="card h-48 animate-pulse bg-cream-150/70" />)}</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Section icon={Tags} title="Purposes & phases">
            <div className="space-y-3">
              <Chips items={data.purposes} tone="gold" />
              <Chips items={data.phaseTypes} />
            </div>
          </Section>

          <Section icon={Cable} title="Cable types" delay={60}>
            <div className="space-y-3">
              {data.cableTypes.map((c) => (
                <div key={c.type} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="mb-2 text-sm font-semibold text-ink-900">{c.type}</div>
                  <Chips items={[...c.materials, ...c.sizes]} />
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Lightbulb} title="Light fittings & wattage" delay={120}>
            <div className="space-y-3">
              {data.lightTypes.map((l) => (
                <div key={l.name} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="mb-2 text-sm font-semibold text-ink-900">{l.name}</div>
                  <Chips items={l.watts} tone="gold" />
                </div>
              ))}
            </div>
          </Section>

          <Section icon={UtilityPole} title="Pole types" delay={180}>
            <div className="space-y-3">
              {data.poleTypes.map((p) => (
                <div key={p.name} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="mb-2 text-sm font-semibold text-ink-900">{p.name}</div>
                  <div className="space-y-1.5">
                    <Chips items={p.heights} tone="green" />
                    {p.bracketTypes?.length > 0 && <Chips items={p.bracketTypes} tone="info" />}
                    {p.brackets?.length > 0 && <Chips items={p.brackets} />}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
