import { Outlet } from 'react-router-dom'
import { AppSidebar } from '../../components'

export function AuthenticatedLayout() {
  return (
    <div className="authenticated-layout">
      <AppSidebar />
      <div className="authenticated-content">
        <Outlet />
      </div>
    </div>
  )
}
