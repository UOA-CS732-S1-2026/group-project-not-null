import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ClipboardList, Clock3 } from 'lucide-react'
import { Main, StaffEntryHeader } from '../../components'
import { getMyStaffTickets } from '../../services/api.js'
import './StaffTickets.css'

const categoryLabels = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance',
}

const statusLabels = {
  open: 'Open',
  in_progress: 'Pending',
  resolved: 'Resolved',
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

function getDisplayName(user) {
  if (!user) return ''
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email || ''
}

export default function StaffTickets() {
  const user = getStoredUser()
  const role = user?.role || user?.user_role
  const canViewStaffTickets = role === 'staff' || role === 'admin'
  const [tickets, setTickets] = useState([])
  const [summary, setSummary] = useState({ assignedToMe: 0, inProgress: 0, highPriority: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!canViewStaffTickets) {
      setIsLoading(false)
      return undefined
    }

    let isMounted = true

    async function loadAssignedTickets() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getMyStaffTickets()

        if (isMounted) {
          setTickets(data.tickets || [])
          setSummary(data.summary || { assignedToMe: 0, inProgress: 0, highPriority: 0 })
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load assigned tickets.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAssignedTickets()

    return () => {
      isMounted = false
    }
  }, [canViewStaffTickets])

  const staffName = getDisplayName(user) || 'Staff'
  const formattedTickets = useMemo(() => tickets.map(formatTicketCard), [tickets])
  const metrics = [
    {
      label: 'Assigned to Me',
      value: summary.assignedToMe,
      detail: 'Active queue',
      icon: ClipboardList,
    },
    {
      label: 'In Progress',
      value: summary.inProgress,
      detail: 'Currently moving',
      icon: Clock3,
    },
    {
      label: 'High Priority',
      value: summary.highPriority,
      detail: 'Critical or high',
      icon: AlertTriangle,
    },
  ]

  if (!canViewStaffTickets) {
    return (
      <Main className="staff-tickets-page">
        <section className="staff-access-denied panel">
          <p className="page-eyebrow">Staff Tickets</p>
          <h1>Access Denied</h1>
          <p>You need a staff or admin account to view assigned staff tickets.</p>
          <Link className="button button-primary" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </Main>
    )
  }

  return (
    <Main className="staff-tickets-page">
      <StaffEntryHeader
        title="Your Tickets"
        staffName={staffName}
        unreadCount={0}
      />

      <section className="staff-ticket-summary" aria-label="Assigned ticket summary">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article className="staff-ticket-metric" key={metric.label}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </div>
              <Icon size={22} aria-hidden="true" />
            </article>
          )
        })}
      </section>

      <section className="staff-ticket-board panel">
        <div className="staff-ticket-board-header">
          <div>
            <h2>Assigned Tickets</h2>
          </div>
          <span>{isLoading ? 'Loading...' : `${formattedTickets.length} tickets`}</span>
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        {!error && isLoading ? (
          <div className="staff-ticket-grid">
            {[1, 2, 3].map((item) => (
              <article className="staff-ticket-card staff-ticket-card-loading" key={item}>
                <span />
                <strong />
                <p />
                <p />
              </article>
            ))}
          </div>
        ) : null}

        {!error && !isLoading && formattedTickets.length === 0 ? (
          <div className="staff-ticket-empty">
            <h3>You're all caught up!</h3>
            <p>No assigned tickets need your attention right now.</p>
          </div>
        ) : null}

        {!error && !isLoading && formattedTickets.length > 0 ? (
          <div className="staff-ticket-grid">
            {formattedTickets.map((ticket) => (
              <article className="staff-ticket-card" key={ticket.id}>
                <div className="staff-ticket-card-topline">
                  <span className="staff-ticket-number">#{ticket.ticketNumber}</span>
                  <h3>{ticket.title}</h3>
                </div>

                <div className="staff-ticket-card-meta">
                  <div className="staff-ticket-badges">
                    <span className={`staff-priority-pill priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                    <span className={`staff-status-badge status-${ticket.statusValue}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <span className="staff-ticket-timestamp">{ticket.created}</span>
                </div>

                <div className="staff-ticket-card-foot">
                  <span className="staff-ticket-department-label">Department:</span>
                  <span className="staff-ticket-department">
                    {ticket.department}
                  </span>
                </div>

                <Link className="button button-primary staff-ticket-action" to={`/tickets/${ticket.id}`}>
                  Update Status
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </Main>
  )
}

function formatTicketCard(ticket) {
  return {
    id: ticket._id,
    ticketNumber: ticket.ticketNumber || ticket._id,
    title: ticket.title || 'Untitled ticket',
    priority: getPriorityLabel(ticket.priority),
    studentName: getPersonName(ticket.studentId, 'Unknown student'),
    department: categoryLabels[ticket.category] || ticket.category || 'Unknown department',
    status: statusLabels[ticket.status] || ticket.status || 'Open',
    statusValue: ticket.status || 'open',
    created: `Created ${getTimeAgo(ticket.createdAt)}`,
  }
}

function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical'
  if (priority === 2) return 'High'
  if (priority === 3) return 'Medium'
  if (priority === 4) return 'Low'
  return 'Medium'
}

function getPersonName(user, fallback) {
  if (!user) return fallback
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback
}

function getTimeAgo(value) {
  if (!value) return 'at an unknown time'

  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))

  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h ago` : `${days}d ago`
}
