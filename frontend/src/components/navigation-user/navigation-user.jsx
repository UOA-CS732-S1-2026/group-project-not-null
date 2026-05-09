import { Link } from 'react-router-dom'
import './navigation-user.css'

export function NavUser({ user }) {
  return (
    <div className="nav-user">
      <span className="user-avatar" aria-hidden="true">
        {user.initials}
      </span>
      <span className="user-copy">
        <strong>{user.name}</strong>
        <small>{user.email}</small>
      </span>
      <Link className="sign-out-link" to="/sign-in">
        ⇅
        <span>Sign out</span>
      </Link>
    </div>
  )
}
