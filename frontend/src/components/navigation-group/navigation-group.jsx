import { NavLink } from 'react-router-dom'

import { LayoutDashboard, PlusIcon } from 'lucide-react'
import './navigation-group.css'

const STUDENT_NAV_ITEMS = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Create Ticket', url: '/tickets/new', icon: PlusIcon },
]

function getVisibleItems({ title, items, role }) {
  if (role === 'admin') {
    if (title === 'Admin') return items
    return []
  }

  if (role !== 'student') {
    return title === 'Admin' ? [] : items
  }

  if (title !== 'General') {
    return []
  }

  return STUDENT_NAV_ITEMS
}

export function NavGroup({ title, items, role, onNavigate }) {
  const visibleItems = getVisibleItems({ title, items, role })

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <section className="sidebar-group" aria-labelledby={`${title}-nav-group`}>
      <h2 id={`${title}-nav-group`}>{title}</h2>
      <nav className="sidebar-nav" aria-label={title}>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isGlyph = typeof Icon === 'string'

          return (
            <NavLink
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
              }
              key={item.title}
              to={item.url}
              onClick={onNavigate}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {isGlyph ? <span className="sidebar-link-glyph">{Icon}</span> : <Icon />}
              </span>
              <span className="sidebar-link-label">{item.title}</span>
            </NavLink>
          )
        })}
      </nav>
    </section>
  )
}
