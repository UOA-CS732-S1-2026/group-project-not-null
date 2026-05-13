import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, SectionError, SectionSkeleton } from '../dashboard-section-state'
import './StaffPriorityQueue.css'

export default function StaffPriorityQueue({ tickets, isLoading, error, onRetry }) {
  const navigate = useNavigate()

  return (
    <aside className="staff-panel urgent-panel" aria-labelledby="urgent-title">
      <div className="staff-panel-heading">
        <div>
          <h2 id="urgent-title">Priority Queue</h2>
          <p>Critical, aging, and overdue tickets.</p>
        </div>
        <AlertCircle size={20} aria-hidden="true" />
      </div>

      {isLoading ? (
        <SectionSkeleton rows={3} />
      ) : error ? (
        <SectionError message="Unable to load urgent tickets." onRetry={onRetry} />
      ) : tickets.length === 0 ? (
        <EmptyState message="No urgent tickets right now." />
      ) : (
        <div className="urgent-list">
          {tickets.map((ticket) => (
            <button
              className="urgent-card"
              type="button"
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <strong>{ticket.title}</strong>
              <span>{ticket.meta}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
