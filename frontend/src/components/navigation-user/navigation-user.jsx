import { useNavigate } from 'react-router-dom'
import './navigation-user.css'

export function NavUser({ user }) {
  const navigate = useNavigate()

  function handleSignOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    navigate('/')
  }

  return (
    <div className="nav-user">
      <p className="nav-user-name">
        <strong>Name:</strong> {user?.name}
      </p>

      <p className="nav-user-email">
        <strong>Email:</strong> {user?.email}
      </p>

      <button className="button button-primary" onClick={handleSignOut}>
        Sign Out
      </button>

      <div className="nav-user-footer">
        <p className="nav-user-team">Team Not Null ·</p>
        <span className="nav-user-year">2026</span>
      </div>
    </div>
  )
}