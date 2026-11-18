import { memo, useState } from 'react'
import { ImageOff } from 'lucide-react'

// native lazy loading + async decode + fade-in; image नसेल तर placeholder
function LazyImage({ src, alt = '', className = '', zoom = false, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-cream-150 text-ink-300 ${className}`}>
        <ImageOff className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className={`group overflow-hidden bg-cream-150 ${className}`} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${zoom ? 'group-hover:scale-110' : ''}`}
      />
    </div>
  )
}

export default memo(LazyImage)
