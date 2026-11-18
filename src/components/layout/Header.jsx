import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, User as UserIcon, MapPin } from 'lucide-react'
import { selectUser } from '../../features/auth/authSlice'
import { toggleSidebar } from '../../app/store'
import { ROLE_LABELS } from '../../utils/constants'

function Header() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  return (
    <header className="sticky top-4 z-30 mx-4 mt-4 flex h-16 items-center justify-between gap-4 rounded-full border border-cream-200 bg-white/85 pl-4 pr-2.5 shadow-raised backdrop-blur-xl sm:pl-6 lg:ml-2 lg:mr-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cream-300 bg-white text-ink-700 hover:bg-cream-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="relative hidden h-2.5 w-2.5 shrink-0 sm:flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
        </span>
        <h1 className="truncate font-display text-sm font-semibold tracking-tight text-ink-900 sm:text-lg">
          Street-light Meter &amp; Pole Survey
        </h1>
        <span className="hidden shrink-0 items-center rounded-full border border-gold-300/60 bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600 sm:inline-flex">
          {ROLE_LABELS[user?.role] || 'User'}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {user?.ward && (
          <div className="hidden h-10 items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-4 text-xs font-medium text-ink-700 md:flex">
            <MapPin className="h-4 w-4 text-brand-600" />
            {user.ward}
          </div>
        )}
        <div className="flex h-11 items-center gap-2.5 rounded-full bg-cream-150 py-1 pl-1 pr-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 bg-brand-100">
            <UserIcon className="h-4 w-4 text-brand-600" />
          </span>
          <span className="hidden flex-col text-left md:flex">
            <span className="text-sm font-medium leading-tight text-ink-900">{user?.fullName || 'User'}</span>
            <span className="text-[11px] leading-tight text-ink-400">@{user?.userName}</span>
          </span>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
