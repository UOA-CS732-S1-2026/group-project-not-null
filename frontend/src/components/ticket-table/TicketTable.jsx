import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './TicketTable.css'

const PRIORITY_LABEL = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' }
const CATEGORY_LABEL = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance',
}
const STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
}

export default function TicketTable({
  tickets = [],
  mode = 'active',
  emptyMessage = 'No tickets found.',
}) {
  const navigate = useNavigate()
  const isArchive = mode === 'archive'

  if (tickets.length === 0) {
    return <p className="admin-empty">{emptyMessage}</p>
  }

  return (
    <div className={`admin-tickets-table-wrap ticket-table-mode-${mode}`}>
      <table className="admin-table admin-tickets-table">
        <thead>
          <tr>
            {!isArchive && <th>Priority</th>}
            <th>Ticket #</th>
            <th>Title</th>
            <th>Student</th>
            <th>Category</th>
            {!isArchive && <th>Status</th>}
            <th>{isArchive ? 'Date Resolved' : 'Updated'}</th>
            {!isArchive && <th>Assigned To</th>}
            {isArchive && <th>View Details</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const priority = PRIORITY_LABEL[ticket.priority] || 'Low'
            const ticketId = ticket._id || ticket.id

            return (
              <tr
                key={ticketId}
                className="admin-ticket-row"
                onClick={() => navigate(`/tickets/${ticketId}`, isArchive ? { state: { readOnly: true } } : undefined)}
              >
                {!isArchive && (
                  <td>
                    <span className={`admin-priority-badge admin-priority-${priority.toLowerCase()}`}>
                      {priority}
                    </span>
                  </td>
                )}
                <td className="admin-ticket-number">{ticket.ticketNumber || ticketId}</td>
                <td className="admin-ticket-title" title={ticket.title}>{ticket.title || 'Untitled ticket'}</td>
                <td>{personName(ticket.studentId)}</td>
                <td>{CATEGORY_LABEL[ticket.category] || ticket.category || 'Unknown'}</td>
                {!isArchive && (
                  <td>
                    <span className={`admin-status-badge admin-ticket-status-${ticket.status || 'open'}`}>
                      {STATUS_LABEL[ticket.status] || ticket.status || 'Unknown'}
                    </span>
                  </td>
                )}
                <td>{isArchive ? formatDate(ticket.resolvedAt || ticket.updatedAt) : timeAgo(ticket.updatedAt)}</td>
                {!isArchive && <td>{personName(ticket.assignedToStaffId)}</td>}
                {isArchive && (
                  <td>
                    <button className="archive-history-button" type="button" aria-label="View details">
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function personName(user) {
  if (!user) return 'Unassigned'
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unassigned'
}

function timeAgo(value) {
  if (!value) return '—'
  const mins = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(value) {
  if (!value) return 'Unknown'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
