import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TicketTable } from '../../components/ticket-table'
import { getArchivedTickets } from '../../services/api.js'

const PAGE_SIZE = 15
const DEV_FALLBACK_TICKETS = [
  {
    _id: 'demo-1',
    ticketNumber: 'A-1024',
    title: 'Password reset assistance',
    category: 'IT',
    status: 'resolved',
    priority: 2,
    studentId: { firstName: 'Jordan', lastName: 'Lee', email: 'jordan.lee@campus.edu' },
    assignedToStaffId: { firstName: 'Cam', lastName: 'Nguyen', email: 'cam.nguyen@campus.edu' },
    updatedAt: '2026-03-04T12:30:00.000Z',
  },
  {
    _id: 'demo-2',
    ticketNumber: 'A-1088',
    title: 'Accommodation payment follow-up',
    category: 'accommodation/finance',
    status: 'resolved',
    priority: 3,
    studentId: { firstName: 'Sam', lastName: 'Patel', email: 'sam.patel@campus.edu' },
    assignedToStaffId: { firstName: 'Riley', lastName: 'Chen', email: 'riley.chen@campus.edu' },
    updatedAt: '2026-03-10T09:10:00.000Z',
  },
]
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export default function ArchivePage() {
  const user = getStoredUser()
  const role = user?.role || user?.user_role
  const canViewArchive = role === 'staff' || role === 'admin'
  const [tickets, setTickets] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!canViewArchive) {
      setIsLoading(false)
      return undefined
    }

    let isMounted = true

    async function loadArchive() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getArchivedTickets({ page, limit: PAGE_SIZE })
        if (isMounted) {
          setTickets(data.tickets || [])
          setTotalCount(data.totalCount || 0)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load archived tickets.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadArchive()

    return () => {
      isMounted = false
    }
  }, [canViewArchive, page])

  const showFallback = import.meta.env.DEV && !isLoading && !error && tickets.length === 0
  const displayTickets = showFallback ? DEV_FALLBACK_TICKETS : tickets
  const displayCount = showFallback ? DEV_FALLBACK_TICKETS.length : totalCount
  const totalPages = Math.max(1, Math.ceil(displayCount / PAGE_SIZE))

  if (!canViewArchive) {
    return (
      <div className="admin-page admin-page-wide">
        <div className="admin-page-header">
          <h1>Archive</h1>
          <p>Resolved ticket history for staff and admin review.</p>
        </div>
        <section className="admin-section">
          <h2>Access Denied</h2>
          <p>Only staff and admins can view archived tickets.</p>
          <Link className="button button-primary" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-page-header">
        <h1>Archive</h1>
        <p>Resolved ticket history for staff and admin review.</p>
      </div>
      <section className="admin-section">
        <h2>Resolved History</h2>
        {isLoading ? (
          <p className="admin-loading">Loading tickets…</p>
        ) : error ? (
          <p className="admin-section-error" role="alert">{error}</p>
        ) : (
          <TicketTable tickets={displayTickets} mode="archive" emptyMessage="No archived tickets found." />
        )}
        {!error && displayTickets.length > 0 ? (
          <footer className="ticket-table-pagination">
            <button
              className="ticket-table-pagination-link"
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="ticket-table-pagination-link"
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
            >
              Next
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  )
}
