import { memo } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

// ── Row memoized: page बदलला नाही तर rows re-render होत नाहीत ──
const Row = memo(function Row({ row, columns, onRowClick }) {
  return (
    <tr
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={`transition-colors duration-200 hover:bg-brand-50/60 ${onRowClick ? 'cursor-pointer' : ''}`}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`px-4 py-3 align-middle text-ink-800 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
        >
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  )
})

function SkeletonRows({ columns, rows = 8 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {columns.map((c) => (
        <td key={c.key} className="px-4 py-3.5">
          <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded-full bg-cream-200" />
        </td>
      ))}
    </tr>
  ))
}

function DataTable({
  columns = [],
  data = [],
  keyField = '_id',
  loading = false,
  fetching = false,
  emptyMessage = 'No records found',
  sort,
  order,
  onSort,
  onRowClick,
}) {
  return (
    <div className="relative w-full overflow-x-auto">
      {/* background refetch indicator — data दिसत राहतो, फक्त वर पातळ bar */}
      {fetching && !loading && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-progress bg-brand-400" />
        </div>
      )}
      <table className={`w-full border-collapse text-left text-sm transition-opacity ${fetching && !loading ? 'opacity-70' : ''}`}>
        <thead>
          <tr className="border-b border-cream-200 bg-cream-150/60 text-[12.5px] font-semibold text-ink-500">
            {columns.map((col) => {
              const sortable = col.sortable && onSort
              const active = sort === col.key
              const Icon = active ? (order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
              return (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.headerClassName || ''}`}
                >
                  {sortable ? (
                    <button
                      onClick={() => onSort(col.key, active && order === 'desc' ? 'asc' : 'desc')}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-brand-700 ${active ? 'text-brand-700' : ''}`}
                    >
                      {col.header}
                      <Icon className="h-3.5 w-3.5 opacity-70" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-200/70">
          {loading ? (
            <SkeletonRows columns={columns} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-ink-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => <Row key={row[keyField]} row={row} columns={columns} onRowClick={onRowClick} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

export default memo(DataTable)
