import { Main } from '../../components'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { studentTickets, ticketCategories } from './tickets/ticketData.js'
import { Square, Ellipsis, CheckCheck, CircleAlert } from 'lucide-react'

export default function DashBoard() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [query, setQuery] = useState('')

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return studentTickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'All' || ticket.status === statusFilter
      const matchesCategory =
        categoryFilter === 'All' || ticket.category === categoryFilter
      const matchesQuery =
        !normalizedQuery ||
        [ticket.title, ticket.category, ticket.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [categoryFilter, query, statusFilter])

  const summary = [
    {
      label: 'Open tickets',
      value: studentTickets.filter((ticket) => ticket.status === 'Open').length,
      detail: 'Waiting for review',
      icon: <Square size={18} aria-label="Open tickets" />, // Lucide Square
    },
    {
      label: 'In progress',
      value: studentTickets.filter((ticket) => ticket.status === 'In Progress').length,
      detail: 'Staff are working',
      icon: <Ellipsis size={18} aria-label="In progress" />, // Lucide Ellipsis
    },
    {
      label: 'Resolved',
      value: studentTickets.filter((ticket) => ticket.status === 'Resolved').length,
      detail: 'Previous tickets',
      icon: <CheckCheck size={18} aria-label="Resolved" />, // Lucide CheckCheck
    },
    {
      label: 'Urgent tickets',
      value: studentTickets.filter((ticket) => ticket.urgency === 'High').length,
      detail: 'High urgency',
      icon: <CircleAlert size={18} aria-label="Urgent tickets" />, // Lucide CircleAlert
    },
  ]

  return (
      <Main className="home-main">
        <section className="home-title-row">
          <div>
            <h1>My Support</h1>
            <p>Track your questions from open to resolved.</p>
          </div>
          <div className="home-title-actions">
            <Link className="button button-primary" to="/tickets/new">
              Create ticket
            </Link>
          </div>
        </section>

        <section className="metric-grid home-metric-grid" aria-label="Ticket summary">
          {summary.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-card-header">
                <span>{metric.label}</span>
                <small aria-hidden="true">{metric.icon}</small>
              </div>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <section className="student-support-layout">
          <article className="panel student-ticket-panel">
            <div className="panel-header">
              <div>
                <h2>My Tickets</h2>
                <p>Active tickets are shown first, followed by resolved tickets.</p>
              </div>
              <span>{filteredTickets.length} shown</span>
            </div>

            <div className="student-ticket-filters" aria-label="Ticket filters">
              <label>
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Category</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="All">All categories</option>
                  {ticketCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="student-ticket-card-list">
              {filteredTickets.map((ticket) => (
                <TicketCard ticket={ticket} key={ticket.id} />
              ))}
            </div>
          </article>
        </section>
      </Main>
  )
}

function TicketCard({ ticket }) {
  return (
    <article className="student-ticket-card">
      <div>
        <div className="ticket-card-heading">
          <h3>{ticket.title}</h3>
          <span className={`ticket-status ticket-status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
            {ticket.status}
          </span>
        </div>
        <p className="ticket-meta">
          {ticket.category} · {ticket.urgency} urgency · Priority:{' '}
          {ticket.priority}
        </p>
        <p className="ticket-dates">
          Submitted {ticket.submitted} · Updated {ticket.updated}
        </p>
        <p className="ticket-preview">“{ticket.description}”</p>
      </div>
      <Link className="ticket-detail-link" to={`/tickets/${ticket.id}`}>
        View ticket
      </Link>
    </article>
  )
}
