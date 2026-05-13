import { Navigate, Outlet } from 'react-router-dom'
import { Monitor } from 'lucide-react'
import { AppSidebar } from '../../components'
import './admin-layout.css'

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
        <div className="admin-mobile-banner">
          <Monitor size={16} />
          <span>Admin panel is best viewed on a desktop screen.</span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
