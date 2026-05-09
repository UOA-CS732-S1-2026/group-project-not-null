import { sidebarData } from './sidebar-data.js'
import { NavGroup, NavUser, AppTitle } from '../../components'
import './sidebar.css'

export function AppSidebar() {
  return (
    <aside className="app-sidebar" aria-label="Application navigation">
      <div className="sidebar-header">
        <AppTitle team={sidebarData.team} />
      </div>

      <div className="sidebar-content">
        {sidebarData.navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </div>

      <div className="sidebar-footer">
        <NavUser user={sidebarData.user} />
      </div>
    </aside>
  )
}
