const dateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
})
const numFmt = new Intl.NumberFormat('en-IN')

export const fmtDate = (d) => (d ? dateFmt.format(new Date(d)) : '—')
export const fmtDateTime = (d) => (d ? dateTimeFmt.format(new Date(d)) : '—')
export const fmtNum = (n) => (n === null || n === undefined ? '—' : numFmt.format(n))
export const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase())

export const latLng = (doc) => {
  const c = doc?.location?.coordinates
  return c ? { lat: c[1], lng: c[0] } : null
}

export const mapsLink = (doc) => {
  const p = latLng(doc)
  return p ? `https://www.google.com/maps?q=${p.lat},${p.lng}` : '#'
}

// RTK Query error → message
export const errMsg = (err) => err?.data?.message || err?.error || 'Something went wrong'
