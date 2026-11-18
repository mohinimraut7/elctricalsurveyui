import { Gauge, MapPinned, ShieldCheck } from 'lucide-react'

const YEAR = new Date().getFullYear()

const FEATURES = [
  { icon: Gauge, label: '999 meters & 7,300+ poles across 9 wards' },
  { icon: MapPinned, label: 'GPS-tagged meters, poles & photos' },
  { icon: ShieldCheck, label: 'Ward-wise secure access' },
]

// Login / Register दोघांसाठी common split layout (MIDC login सारखा)
export default function AuthShell({ children }) {
  return (
    <div className="relative grid min-h-dvh w-full bg-gradient-to-br from-cream-50 via-cream-100 to-brand-50 lg:grid-cols-[1.1fr_1fr]">
      {/* ===== Left: hero ===== */}
      <section className="relative hidden overflow-hidden lg:block">
        <img src="/images/login-bg.webp" alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/90 via-brand-600/70 to-brand-900/80" />
        <div className="absolute left-12 top-10 grid grid-cols-4 gap-2 opacity-25">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 p-1 shadow-raised">
              <img src="/logo.png" alt="VVCMC" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">VVCMC</div>
              <div className="text-xs text-white/80">Vasai-Virar City Municipal Corporation</div>
            </div>
          </div>

          <div className="max-w-md animate-slide-up">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs text-gold-300 backdrop-blur-md">
              Electrical Department
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white">
              Street-light Meter &amp; Pole Survey Portal
            </h1>
            <div className="mb-6 mt-4 h-1 w-20 rounded-full bg-gold-400" />
            <ul className="space-y-3">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <li key={label} className="flex animate-slide-up items-center gap-3 text-sm text-white/90" style={{ animationDelay: `${150 + i * 100}ms` }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                    <Icon className="h-4.5 w-4.5 text-gold-300" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">© {YEAR} VVCMC · Electrical Survey</p>
        </div>
      </section>

      {/* ===== Right: form ===== */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="VVCMC" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-display text-xl font-bold text-brand-700">VVCMC</div>
              <div className="text-xs text-ink-500">Electrical Survey Portal</div>
            </div>
          </div>
          <div className="rounded-3xl border border-cream-200 bg-white/90 p-7 shadow-raised backdrop-blur-xl sm:p-9">{children}</div>
        </div>
      </section>
    </div>
  )
}
