# VVCMC Electrical Survey — Frontend

Vite + React 19 + Redux Toolkit (RTK Query) + Tailwind v4.
Layout (floating sidebar, pill header, tables) follows the **MIDC portal**; colours follow the **Vasai-Virar website** (municipal green `#00843C`, soft gold `#C09C24`, warm white `#FAFCFA / #F9F7F0`, forest-green text `#193528`).

## Run

```bash
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5009
npm run dev                 # http://localhost:5173
npm run build               # production build → dist/
```

Backend must be running and the CSV import done first (see `electricalSurveyBackend/Doc.txt`).

## Structure

```
src/
  app/store.js              Redux store (auth + ui + RTK Query api), logout → cache reset
  features/auth/authSlice   token/user, localStorage, JWT expiry check
  services/api.js           RTK Query endpoints + tags, 401 → auto logout, Excel download
  layouts/AdminLayout       Sidebar + Header + Suspense outlet
  components/layout         Sidebar, Header
  components/common         DataTable, Pagination, StatCard, Badge, LazyImage, Accordion, …
  components/map/MiniMap    (lazy)
  pages/auth                Login, Register
  pages/dashboard           Dashboard + DashboardCharts (lazy recharts)
  pages/meters              MeterList (server pagination), MeterDetail (+edit, map, poles)
  pages/poles               PoleList
  pages/map                 MapView (canvas markers)
  pages/quality             DataQuality (accordion, data loads on open)
  pages/users               UserManagement (super_admin)
  pages/coverage            Survey Coverage — ward progress + pending/surveyed consumers (server pagination)
  pages/master              Master Data — pole / light / cable / purpose catalogue
  routes/                   AppRoutes, ProtectedRoute, lazyPages (lazy + preload)
  hooks/                    useDebounce, useQueryParams (filters in URL)
```

## Speed work

- **Route-level lazy loading** — every page is its own chunk; recharts and leaflet only download on the pages that use them. First load ≈ 105 KB gzip.
- **Hover preload** — hovering a sidebar link preloads that page's JS *and* prefetches its data (RTK `usePrefetch`).
- **Server-side pagination** with **next-page prefetch** — "Next" is instant.
- **RTK Query cache** — deduped requests, 2-min cache, tag invalidation after edits, refetch on focus.
- **Memoization** — `React.memo` rows/table/cards, `useMemo` columns & derived chart data, `useCallback` handlers.
- **Debounced search** (400 ms), filters kept in the URL (refresh/back keeps the view).
- **Images** — 320 px webp thumbnails in lists, `loading="lazy"` + async decode, compressed login background and logo.
- **Map** — canvas renderer (`preferCanvas`) + memoized markers; filtering is client-side on one light payload. The 7,000+ poles layer is fetched only when "Show poles" is ticked and drawn as one Leaflet canvas layer (no React component per pole).
- **Meter detail** — up to 120+ linked poles render 25 at a time ("show more").

## Animation standard (shared with VVMC / MIDC)

Fade-in, slide-up (staggered cards), hover lift + shadow transition, image zoom, pulse (live dot), arrow slide, colour transitions, smooth accordion (grid-rows + 180° icon), smooth scroll. `prefers-reduced-motion` is respected.
