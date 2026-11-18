import { useEffect, useState } from 'react'

// search box टाइप करताना प्रत्येक key वर API call नको — 400ms थांबून मगच
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
