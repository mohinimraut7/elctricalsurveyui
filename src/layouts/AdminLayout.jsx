import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import PageLoader from '../components/common/PageLoader'

export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-[18rem]">
        <Header />
        <main className="flex-1 px-4 pb-8 pt-6 lg:pl-2 lg:pr-6">
          {/* Suspense इथे → page बदलताना फक्त content area मध्ये loader, sidebar/header स्थिर */}
          <Suspense fallback={<PageLoader />}>
            <div key={pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
