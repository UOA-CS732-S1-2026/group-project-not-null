import { Link } from 'react-router-dom'
import './app-title.css'

export function AppTitle({ team }) {
  return (
    <Link className="app-title" to="/home">
      <span className="app-title-logo" aria-hidden="true">
        {team.initials}
      </span>
      <span className="app-title-copy">
        <span>{team.name}</span>
        <small>{team.plan}</small>
      </span>
      <span className="app-title-toggle" aria-hidden="true">
        ⇅
      </span>
    </Link>
  )
}
