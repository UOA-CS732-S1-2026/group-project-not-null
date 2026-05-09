import { sidebarData } from './sidebar-data.js'
import { NavGroup, NavUser, AppTitle } from '../../components'
import './sidebar.css'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export function AppSidebar() {
  const storedUser = getStoredUser()
  const user = storedUser
    ? {
        name: `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() || storedUser.email,
        email: storedUser.email,
        initials: `${storedUser.firstName?.[0] || ''}${storedUser.lastName?.[0] || ''}` || 'UD',
      }
    : sidebarData.user

  return (
    <aside className="app-sidebar" aria-label="Application navigation">
      <div className="sidebar-header">
        <AppTitle team={sidebarData.team} />
      </div>

      <div className="sidebar-content">
        {sidebarData.navGroups.map((group) => (
          <NavGroup key={group.title} {...group} role={storedUser?.role} />
        ))}
      </div>

      <div className="sidebar-footer">
        <NavUser user={user} />
      </div>
    </aside>
  )
}
