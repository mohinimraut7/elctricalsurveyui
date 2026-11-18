import { memo, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, Gauge, UtilityPole, Map, ShieldAlert, UsersRound, LogOut, X, Target, Database } from 'lucide-react'
import { logout, selectUser } from '../../features/auth/authSlice'
import { closeSidebar } from '../../app/store'
import { usePrefetch } from '../../services/api'
import { ROLES } from '../../utils/constants'
import * as Pages from '../../routes/lazyPages'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, page: Pages.Dashboard, prefetch: ['getSummary', {}] },
  { to: '/meters', label: 'Meters', icon: Gauge, page: Pages.MeterList, prefetch: ['getMeters', { page: 1, limit: 20, sort: 'surveyedAt', order: 'desc' }] },
  { to: '/poles', label: 'Poles & Lights', icon: UtilityPole, page: Pages.PoleList, prefetch: ['getPoles', { page: 1, limit: 20 }] },
  { to: '/map', label: 'Map View', icon: Map, page: Pages.MapView, prefetch: ['getMeterMap', {}] },
  { to: '/coverage', label: 'Survey Coverage', icon: Target, page: Pages.Coverage, prefetch: ['getCoverage', {}] },
  { to: '/master-data', label: 'Master Data', icon: Database, page: Pages.MasterData, prefetch: ['getMasterData', undefined] },
  { to: '/data-quality', label: 'Data Quality', icon: ShieldAlert, page: Pages.DataQuality },
  { to: '/users', label: 'User Management', icon: UsersRound, page: Pages.UserManagement, roles: [ROLES.SUPER_ADMIN] },
]

function Sidebar() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const open = useSelector((s) => s.ui.sidebarOpen)
  const prefetchSummary = usePrefetch('getSummary')
  const prefetchMeters = usePrefetch('getMeters')
  const prefetchPoles = usePrefetch('getPoles')
  const prefetchMap = usePrefetch('getMeterMap')
  const prefetchCoverage = usePrefetch('getCoverage')
  const prefetchMaster = usePrefetch('getMasterData')
  const prefetchers = {
    getSummary: prefetchSummary, getMeters: prefetchMeters, getPoles: prefetchPoles,
    getMeterMap: prefetchMap, getCoverage: prefetchCoverage, getMasterData: prefetchMaster,
  }

  // hover = page JS chunk + त्याचा data दोन्ही आधीच load
  const warm = useCallback(
    (item) => {
      item.page?.preload?.()
      if (item.prefetch) prefetchers[item.prefetch[0]](item.prefetch[1], { ifOlderThan: 60 })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const close = () => dispatch(closeSidebar())
  const items = NAV.filter((n) => !n.roles || n.roles.includes(user?.role))

  return (
    <>
      {open && <div onClick={close} className="fixed inset-0 z-40 animate-fade-in bg-ink-900/30 backdrop-blur-[2px] lg:hidden" />}

      <aside
        className={`fixed bottom-4 left-4 top-4 z-50 flex w-64 select-none flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white/95 shadow-raised backdrop-blur-xl transition-transform duration-300 ease-in-out lg:z-40 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-[110%]'
        }`}
      >
        {/* ===== Brand ===== */}
        <div className="flex shrink-0 items-center justify-between border-b border-cream-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cream-200 bg-white shadow-card">
              <img src="/logo.png" alt="VVCMC Logo" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold leading-tight tracking-tight text-brand-700">VVCMC</div>
              <div className="text-[10px] leading-tight text-ink-500">
                Vasai-Virar City
                <br />
                Municipal Corporation
              </div>
            </div>
          </div>
          <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-cream-150 hover:text-ink-700 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-gold-600">Electrical Survey</span>
        </div>

        {/* ===== Navigation ===== */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                onMouseEnter={() => warm(item)}
                onFocus={() => warm(item)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-brand'
                      : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-ink-500'}`} strokeWidth={1.8} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ===== Logout ===== */}
        <div className="shrink-0 border-t border-cream-200 px-3 pb-4 pt-4">
          <button
            onClick={() => dispatch(logout())}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-medium text-ink-700 transition-colors hover:bg-gold-50 hover:text-gold-600"
          >
            <LogOut className="h-5 w-5 shrink-0 text-ink-500" strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default memo(Sidebar)
