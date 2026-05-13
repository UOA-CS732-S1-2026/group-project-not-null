import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminTickets } from '../../services/api'
import './AdminTicketsPage.css'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

const PRIORITY_LABEL = { 1: 'Critical', 2: 'High', 3: 'Low' }
const CATEGORY_LABEL = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance',
}
const STATUS_LABEL = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }

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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const debounceRef = useRef(null)

  const loadTickets = useCallback(async (status, q) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAdminTickets({ status, search: q, limit: 50 })
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadTickets(statusFilter, search), 250)
    return () => clearTimeout(debounceRef.current)
  }, [statusFilter, search, loadTickets])

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-page-header">
        <h1>Tickets</h1>
        <p>View all tickets. Open a ticket to assign it to a staff member.</p>
      </div>

      <div className="admin-tickets-toolbar">
        <div className="admin-filter-chips">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`admin-filter-chip${statusFilter === f.value ? ' admin-filter-chip-active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="admin-tickets-search"
          type="search"
          placeholder="Search by title or ticket #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="admin-loading">Loading tickets…</p>
      ) : error ? (
        <p className="admin-section-error">
          {error}{' '}
          <button type="button" onClick={() => loadTickets(statusFilter, search)}>
            Retry
          </button>
        </p>
      ) : tickets.length === 0 ? (
        <p className="admin-empty">No tickets found.</p>
      ) : (
        <div className="admin-tickets-table-wrap">
          <table className="admin-table admin-tickets-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Student</th>
                <th>Category</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="admin-ticket-row" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                  <td>
                    <span className={`admin-priority-badge admin-priority-${(PRIORITY_LABEL[ticket.priority] || 'low').toLowerCase()}`}>
                      {PRIORITY_LABEL[ticket.priority] || '—'}
                    </span>
                  </td>
                  <td className="admin-ticket-number">{ticket.ticketNumber}</td>
                  <td className="admin-ticket-title" title={ticket.title}>{ticket.title}</td>
                  <td>{personName(ticket.studentId)}</td>
                  <td>{CATEGORY_LABEL[ticket.category] || ticket.category}</td>
                  <td>
                    <span className={`admin-status-badge admin-ticket-status-${ticket.status}`}>
                      {STATUS_LABEL[ticket.status] || ticket.status}
                    </span>
                  </td>
                  <td>{timeAgo(ticket.updatedAt)}</td>
                  <td>{personName(ticket.assignedToStaffId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
