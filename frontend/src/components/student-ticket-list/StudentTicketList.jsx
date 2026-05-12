import { Link } from 'react-router-dom'
import './StudentTicketList.css'

export default function StudentTicketList({
  tickets,
  statusFilter,
  categoryFilter,
  categories,
  isLoading,
  error,
  onStatusChange,
  onCategoryChange,
}) {
  return (
    <section className="student-support-layout">
      <article className="panel student-ticket-panel">
        <div className="panel-header">
          <div>
            <h2>My Tickets</h2>
            <p>Active tickets are shown first, followed by resolved tickets.</p>
          </div>
          <span>{tickets.length} shown</span>
        </div>

        <div className="student-ticket-filters" aria-label="Ticket filters">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
              {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)}>
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="student-ticket-card-list">
          {isLoading && <p>Loading tickets...</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {!isLoading && !error && tickets.length === 0 && <p>No tickets match your filters.</p>}
          {!isLoading && !error && tickets.map((ticket) => <TicketCard ticket={ticket} key={ticket.id} />)}
        </div>
      </article>
    </section>
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
          {ticket.category} · {ticket.urgency} urgency · Priority: {ticket.priority}
        </p>
        <p className="ticket-dates">
          Submitted {ticket.submitted} · Updated {ticket.updated}
        </p>
        <p className="ticket-preview">"{ticket.description}"</p>
      </div>
      <Link className="ticket-detail-link" to={`/tickets/${ticket.id}`}>
        View ticket
      </Link>
    </article>
  )
}
