import { NavLink } from 'react-router-dom'
import './navigation-group.css'

export function NavGroup({ title, items }) {
  return (
    <section className="sidebar-group" aria-labelledby={`${title}-nav-group`}>
      <h2 id={`${title}-nav-group`}>{title}</h2>
      <nav className="sidebar-nav" aria-label={title}>
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
            }
            key={item.title}
            to={item.url}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.title}</span>
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
    </section>
  )
}
