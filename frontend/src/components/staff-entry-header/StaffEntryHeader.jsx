import { Bell } from 'lucide-react'
import './StaffEntryHeader.css'

export default function StaffEntryHeader({
  greeting,
  staffName,
  summary,
  unreadCount,
  eyebrow = 'Staff Dashboard',
  title,
}) {
  const heading = title || `${greeting}, ${staffName}`

  return (
    <section className="staff-entry-row" aria-labelledby="staff-dashboard-title">
      <div className="staff-greeting">
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 id="staff-dashboard-title">{heading}</h1>
        <p>{summary}</p>
      </div>

      <div className="staff-alert-row" aria-label="Dashboard alerts">
        <button className="staff-alert-button notification-button" type="button" aria-label="Notifications">
          <Bell size={19} aria-hidden="true" />
          {unreadCount > 0 ? <span className="notification-dot" aria-hidden="true" /> : null}
        </button>
      </div>
    </section>
  )
}
