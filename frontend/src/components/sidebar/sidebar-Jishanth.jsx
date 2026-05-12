import { useState } from 'react'
import { Menu, X } from 'lucide-react'
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
  const [isExpanded, setIsExpanded] = useState(false)
  const storedUser = getStoredUser()
  const user = storedUser
    ? {
        name: `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() || storedUser.email,
        email: storedUser.email,
        initials: `${storedUser.firstName?.[0] || ''}${storedUser.lastName?.[0] || ''}` || 'UD',
      }
    : sidebarData.user

  return (
    <>
      {isExpanded ? (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Collapse navigation"
          onClick={() => setIsExpanded(false)}
        />
      ) : null}

      <aside
        className={`app-sidebar${isExpanded ? ' app-sidebar-expanded' : ''}`}
        aria-label="Application navigation"
      >
      <button
        className="sidebar-menu-button"
        type="button"
        aria-label={isExpanded ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        {isExpanded ? (
          <>
            <X className="lucide-x" size={22} aria-hidden="true" />
            <span className="sidebar-menu-brand">Uni Desk</span>
          </>
        ) : (
          <Menu className="lucide-menu" size={22} aria-hidden="true" />
        )}
      </button>

      <div className="sidebar-header">
        <AppTitle team={sidebarData.team} />
      </div>

      <div className="sidebar-content">
        {sidebarData.navGroups.map((group) => (
          <NavGroup
            key={group.title}
            {...group}
            role={storedUser?.role}
            onNavigate={() => setIsExpanded(false)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <NavUser user={user} />
      </div>
      </aside>
    </>
  )
}
