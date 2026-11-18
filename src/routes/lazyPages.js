import { lazy } from 'react'

// ══════════════════════════════════════════════════════════
//  Route-level code splitting
//  प्रत्येक page चा वेगळा JS chunk — फक्त गरज लागल्यावर download.
//  preload() → sidebar link वर hover केल्यावरच chunk आधीच आणून ठेवतो,
//  म्हणजे click केल्यावर loader दिसतच नाही.
// ══════════════════════════════════════════════════════════
function lazyWithPreload(factory) {
  const Component = lazy(factory)
  Component.preload = factory
  return Component
}

export const Login = lazyWithPreload(() => import('../pages/auth/Login'))
export const Register = lazyWithPreload(() => import('../pages/auth/Register'))
export const Dashboard = lazyWithPreload(() => import('../pages/dashboard/Dashboard'))
export const MeterList = lazyWithPreload(() => import('../pages/meters/MeterList'))
export const MeterDetail = lazyWithPreload(() => import('../pages/meters/MeterDetail'))
export const PoleList = lazyWithPreload(() => import('../pages/poles/PoleList'))
export const MapView = lazyWithPreload(() => import('../pages/map/MapView'))
export const DataQuality = lazyWithPreload(() => import('../pages/quality/DataQuality'))
export const UserManagement = lazyWithPreload(() => import('../pages/users/UserManagement'))
export const Coverage = lazyWithPreload(() => import('../pages/coverage/Coverage'))
export const MasterData = lazyWithPreload(() => import('../pages/master/MasterData'))
