import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import PageLoader from '../components/common/PageLoader'
import { ROLES } from '../utils/constants'
import {
  Login, Register, Dashboard, MeterList, MeterDetail, PoleList, MapView, DataQuality, UserManagement, Coverage, MasterData,
} from './lazyPages'

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader full />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* App */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meters" element={<MeterList />} />
          <Route path="/meters/:id" element={<MeterDetail />} />
          <Route path="/poles" element={<PoleList />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route
            path="/users"
            element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><UserManagement /></ProtectedRoute>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
