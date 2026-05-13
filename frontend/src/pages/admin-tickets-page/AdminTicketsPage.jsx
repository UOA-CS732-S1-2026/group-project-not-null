import { useCallback, useEffect, useRef, useState } from 'react'
import { TicketTable } from '../../components'
import { getAdminTickets } from '../../services/api'
import './AdminTicketsPage.css'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
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
      ) : (
        <TicketTable tickets={tickets} mode="active" emptyMessage="No tickets found." />
      )}
    </div>
  )
}
