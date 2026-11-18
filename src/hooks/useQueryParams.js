import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Filters + page URL मध्ये ठेवतो → refresh / back button / link share केल्यावर same view
export default function useQueryParams(defaults) {
  const [sp, setSp] = useSearchParams()

  const params = useMemo(() => {
    const out = { ...defaults }
    for (const k of Object.keys(defaults)) {
      const v = sp.get(k)
      if (v !== null) out[k] = typeof defaults[k] === 'number' ? Number(v) || defaults[k] : v
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev)
          Object.entries({ ...(resetPage ? { page: 1 } : {}), ...patch }).forEach(([k, v]) => {
            if (v === '' || v === undefined || v === null || v === defaults[k]) next.delete(k)
            else next.set(k, String(v))
          })
          return next
        },
        { replace: true }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSp]
  )

  return [params, update]
}
