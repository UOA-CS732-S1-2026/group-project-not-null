import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './navigation-user.css'

function getInitials(user) {
  if (user?.initials) {
    return user.initials.slice(0, 2).toUpperCase()
  }

  if (user?.name) {
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return user?.email?.[0]?.toUpperCase() || 'U'
}

export function NavUser({ user }) {
  const navigate = useNavigate()
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false)

  function handleSignOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    navigate('/')
  }

  return (
    <div className="nav-user">
      <div className="nav-user-avatar" aria-hidden="true">
        {getInitials(user)}
      </div>

      <div className="nav-user-details">
        <p className="nav-user-name">{user?.name || 'User'}</p>
        <p className="nav-user-email">{user?.email}</p>
      </div>

      <button
        className="nav-user-signout"
        type="button"
        aria-label="Sign out"
        aria-expanded={isConfirmingSignOut}
        onClick={() => setIsConfirmingSignOut((current) => !current)}
      >
        <LogOut size={18} aria-hidden="true" />
      </button>

      {isConfirmingSignOut ? (
        <div className="nav-user-confirm" role="dialog" aria-label="Confirm sign out">
          <p>Are you sure you want to log out?</p>
          <div className="nav-user-confirm-actions">
            <button
              type="button"
              className="nav-user-confirm-cancel"
              onClick={() => setIsConfirmingSignOut(false)}
            >
              Cancel
            </button>
            <button type="button" className="nav-user-confirm-logout" onClick={handleSignOut}>
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
