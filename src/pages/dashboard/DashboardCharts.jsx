import { memo, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'

const GREEN = '#00843C'
const GREEN_LIGHT = '#98cbac'
const GOLD = '#C09C24'
const PALETTE = ['#00843C', '#C09C24', '#3d7a8c', '#4fa673', '#997c1c', '#85958a']
const axis = { fontSize: 11, fill: '#5b6f62' }
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e7e0', boxShadow: '0 12px 30px -16px rgb(25 53 40 / .3)', fontSize: 12 }

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card card-hover animate-slide-up p-5 ${className}`}>
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-ink-500">{subtitle}</p>}
      {children}
    </div>
  )
}

function Donut({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none">
          {data.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const toPairs = (obj) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }))

function DashboardCharts({ data }) {
  // memoized derived data — parent re-render झाला तरी पुन्हा compute नाही
  const wardData = useMemo(
    () => data.meters.byWard.map((w) => ({ ward: w.ward.replace('Ward ', ''), threePhase: w.threePhase, singlePhase: w.count - w.threePhase })),
    [data]
  )
  const purpose = useMemo(() => toPairs(data.meters.byPurpose), [data])
  const timeline = useMemo(() => data.meters.byDate.map((d) => ({ date: d.date.slice(5), count: d.count })), [data])
  const poleTypes = useMemo(() => toPairs(data.poles.byPoleType), [data])
  const lightTypes = useMemo(() => toPairs(data.poles.byLightType), [data])
  const cables = useMemo(() => toPairs(data.poles.byCable), [data])
  const polesByWard = useMemo(
    () => data.meters.byWard.map((w) => ({ ward: w.ward.replace('Ward ', ''), poles: data.poles.byWard?.[w.ward] || 0 })),
    [data]
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Meters by ward" subtitle="Stacked by phase type" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wardData} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="#eef1ec" />
              <XAxis dataKey="ward" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f2f8f4' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="threePhase" name="Three phase" stackId="a" fill={GREEN} />
              <Bar dataKey="singlePhase" name="Single phase" stackId="a" fill={GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Meter purpose" subtitle="Connection usage">
          <Donut data={purpose} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Survey progress" subtitle="Meters surveyed per day" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eef1ec" />
              <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" name="Meters" stroke={GREEN} strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Pole types" subtitle="From pole survey">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={poleTypes} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f2f8f4' }} />
              <Bar dataKey="value" name="Poles" fill={GREEN_LIGHT} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Light fittings" subtitle="By fitting type">
          <Donut data={lightTypes} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Poles by ward" subtitle="Surveyed poles per ward" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={polesByWard} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="#eef1ec" />
              <XAxis dataKey="ward" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f2f8f4' }} />
              <Bar dataKey="poles" name="Poles" fill={GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Cable type" subtitle="Feeding the poles">
          <Donut data={cables} />
        </Panel>
      </div>
    </div>
  )
}

export default memo(DashboardCharts)
