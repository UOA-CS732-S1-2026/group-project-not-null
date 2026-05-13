import { NavLink } from 'react-router-dom'
import './navigation-group.css'

function getVisibleItems({ items, role }) {
  return items.filter((item) => !item.staffOnly || role === 'staff')
}

export function NavGroup({ title, items, role, onNavigate }) {
  const visibleItems = getVisibleItems({ items, role })

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
