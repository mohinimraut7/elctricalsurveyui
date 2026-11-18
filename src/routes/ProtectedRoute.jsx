import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice'

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuth = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const location = useLocation()

  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

export function GuestRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated)
  return isAuth ? <Navigate to="/dashboard" replace /> : children
}
