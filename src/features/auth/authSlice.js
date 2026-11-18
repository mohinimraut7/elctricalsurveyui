import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'vvcmc_es_auth'

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!raw?.token) return { token: null, user: null }
    // JWT expiry check (payload decode) — expired token असेल तर लगेच logout
    const payload = JSON.parse(atob(raw.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp * 1000 < Date.now()) return { token: null, user: null }
    return raw
  } catch {
    return { token: null, user: null }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token
      state.user = payload.user
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch { /* storage unavailable */ }
    },
    logout(state) {
      state.token = null
      state.user = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch { /* storage unavailable */ }
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

// ── Selectors ──
export const selectToken = (s) => s.auth.token
export const selectUser = (s) => s.auth.user
export const selectIsAuthenticated = (s) => !!s.auth.token
