import { Navigate, Outlet } from 'react-router-dom'
import { AppSidebar } from '../../components'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export function AdminLayout() {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    return <Navigate to="/sign-in" replace />
  }

  const user = getStoredUser()
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
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
