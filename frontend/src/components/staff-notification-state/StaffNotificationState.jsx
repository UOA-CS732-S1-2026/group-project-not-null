import { Bell } from 'lucide-react'
import './StaffNotificationState.css'

export default function StaffNotificationState({ notificationState }) {
  if (notificationState.error) {
    return (
      <section className="staff-empty-state" aria-label="Notification error">
        <Bell size={22} aria-hidden="true" />
        <p>Unable to load dashboard data.</p>
      </section>
    )
  }

  if (!notificationState.isLoading && notificationState.data.notifications.length === 0) {
    return (
      <section className="staff-empty-state" aria-label="Notifications empty state">
        <Bell size={22} aria-hidden="true" />
        <p>No notifications right now.</p>
      </section>
    )
  }

  return null
}
