import { configureStore, createSlice } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer, { logout } from '../features/auth/authSlice'
import { api } from '../services/api'

// ── UI slice — mobile sidebar ──
const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen },
    closeSidebar: (s) => { s.sidebarOpen = false },
  },
})
export const { toggleSidebar, closeSidebar } = uiSlice.actions

// logout झाल्यावर जुना cached data (दुसऱ्या user चा) साफ करा
const resetApiOnLogout = (store) => (next) => (action) => {
  const result = next(action)
  if (action.type === logout.type) store.dispatch(api.util.resetApiState())
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (gDM) => gDM().concat(api.middleware, resetApiOnLogout),
})

// tab focus / reconnect वर stale data refetch
setupListeners(store.dispatch)
