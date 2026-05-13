import { Navigate, Outlet } from 'react-router-dom'
import { AppSidebar } from '../../components'

export function AuthenticatedLayout() {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return <Navigate to="/sign-in" replace />
  }

  return (
    <div className="authenticated-layout">
      <AppSidebar />
      <div className="authenticated-content">
        <Outlet />
      </div>
    </div>
  )
}