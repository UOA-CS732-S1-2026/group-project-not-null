import { CheckCircle2, Clock3, MessageSquare, Users } from 'lucide-react'
import { EmptyState, SectionError, SectionSkeleton } from '../dashboard-section-state'
import './StaffActivityFeed.css'

export default function StaffActivityFeed({ activity, isLoading, error, onRetry }) {
  return (
    <article className="staff-panel activity-panel" aria-labelledby="activity-title">
      <div className="staff-panel-heading">
        <div>
          <h2 id="activity-title">Recent Activity</h2>
          <p>Latest support desk movement.</p>
        </div>
      </div>
      {isLoading ? (
        <SectionSkeleton rows={4} />
      ) : error ? (
        <SectionError message="Unable to load dashboard data." onRetry={onRetry} />
      ) : activity.length === 0 ? (
        <EmptyState message="No recent activity yet." />
      ) : (
        <div className="activity-list">
          {activity.map((item) => (
            <ActivityItem key={item.id} {...formatActivityItem(item)} />
          ))}
        </div>
      )}
    </article>
  )
}

function ActivityItem({ icon: Icon, text, time }) {
  return (
    <div className="activity-item">
      <span><Icon size={16} aria-hidden="true" /></span>
      <p>{text}<small>{time}</small></p>
    </div>
  )
}

function formatActivityItem(item) {
  const icons = {
    resolved: CheckCircle2,
    assigned: Users,
    submitted: MessageSquare,
    status_changed: Clock3,
  }

  return {
    icon: icons[item.type] || Clock3,
    text: item.text,
    time: getTimeAgo(item.timestamp),
  }
}

function getTimeAgo(value) {
  if (!value) return 'Unknown'

  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))

  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}
