import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../utils/constants'
import { logout } from '../features/auth/authSlice'

// ══════════════════════════════════════════════════════════
//  RTK Query — single API slice
//  • Same query दोनदा → network call एकदाच (dedupe + cache)
//  • keepUnusedDataFor → page परत उघडलं तर instant
//  • tags → meter edit झाल्यावर फक्त संबंधित data refetch
// ══════════════════════════════════════════════════════════

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

// 401 आला तर auto logout
const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra)
  if (result.error?.status === 401 && api.endpoint !== 'login') api.dispatch(logout())
  return result
}

// रिकामे filters URL मध्ये पाठवू नका (cache key पण स्वच्छ राहते)
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  keepUnusedDataFor: 120,
  tagTypes: ['Meter', 'Pole', 'Summary', 'User', 'Coverage', 'Master'],
  endpoints: (b) => ({
    // ── Auth ──
    login: b.mutation({ query: (body) => ({ url: '/users/login', method: 'POST', body }) }),
    register: b.mutation({ query: (body) => ({ url: '/users/register', method: 'POST', body }) }),

    // ── Dashboard ──
    getSummary: b.query({
      query: (params) => ({ url: '/dashboard/summary', params: clean(params) }),
      transformResponse: (r) => r.data,
      providesTags: ['Summary'],
    }),

    // ── Meters (server-side pagination) ──
    getMeters: b.query({
      query: (params) => ({ url: '/meters/getAll', params: clean(params) }),
      providesTags: (r) =>
        r ? [...r.data.map((m) => ({ type: 'Meter', id: m._id })), { type: 'Meter', id: 'LIST' }] : [{ type: 'Meter', id: 'LIST' }],
    }),
    getMeterMap: b.query({
      query: (params) => ({ url: '/meters/map', params: clean(params) }),
      transformResponse: (r) => r.data,
      keepUnusedDataFor: 300,
      providesTags: [{ type: 'Meter', id: 'MAP' }],
    }),
    getMeter: b.query({
      query: (id) => `/meters/${id}`,
      transformResponse: (r) => r.data,
      providesTags: (r, e, id) => [{ type: 'Meter', id }],
    }),
    updateMeter: b.mutation({
      query: ({ id, ...body }) => ({ url: `/meters/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Meter', id }, { type: 'Meter', id: 'LIST' }, { type: 'Meter', id: 'MAP' }, 'Summary'],
    }),

    // ── Poles ──
    getPoles: b.query({
      query: (params) => ({ url: '/poles/getAll', params: clean(params) }),
      providesTags: ['Pole'],
    }),

    getPoleMap: b.query({
      query: (params) => ({ url: '/poles/map', params: clean(params) }),
      transformResponse: (r) => r.data,
      keepUnusedDataFor: 300,
    }),

    // ── Survey coverage (ward consumer list) ──
    getCoverage: b.query({
      query: (params) => ({ url: '/coverage/summary', params: clean(params) }),
      transformResponse: (r) => r.data,
      providesTags: ['Coverage'],
    }),
    getMasterConsumers: b.query({
      query: (params) => ({ url: '/coverage/consumers', params: clean(params) }),
      providesTags: ['Coverage'],
    }),

    // ── Master catalogue (staticdatas) — क्वचितच बदलतो, 1 तास cache ──
    getMasterData: b.query({
      query: () => '/master',
      transformResponse: (r) => r.data,
      keepUnusedDataFor: 3600,
      providesTags: ['Master'],
    }),

    // ── Users (super_admin) ──
    getUsers: b.query({
      query: () => '/users/getAll',
      transformResponse: (r) => r.data,
      providesTags: ['User'],
    }),
    createUser: b.mutation({
      query: (body) => ({ url: '/users/create', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: b.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetSummaryQuery,
  useGetMetersQuery,
  useGetMeterMapQuery,
  useGetMeterQuery,
  useUpdateMeterMutation,
  useGetPolesQuery,
  useGetPoleMapQuery,
  useGetCoverageQuery,
  useGetMasterConsumersQuery,
  useGetMasterDataQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePrefetch,
} = api

// ── Excel export (blob download — RTK Query cache मध्ये ठेवायची गरज नाही) ──
export async function downloadMetersExcel(params, token) {
  const qs = new URLSearchParams(clean(params)).toString()
  const res = await fetch(`${API_URL}/api/meters/export?${qs}`, { headers: { authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `vvcmc-meters-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
