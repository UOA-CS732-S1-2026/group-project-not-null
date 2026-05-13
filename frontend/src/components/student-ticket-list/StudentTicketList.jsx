import { Link } from 'react-router-dom'
import './StudentTicketList.css'

export default function StudentTicketList({
  tickets,
  statusFilter,
  categoryFilter,
  categories,
  totalTickets,
  currentPage,
  totalPages,
  isLoading,
  error,
  onStatusChange,
  onCategoryChange,
  onPageChange,
}) {
  const visibleStart = totalTickets === 0 ? 0 : (currentPage - 1) * 5 + 1
  const visibleEnd = totalTickets === 0 ? 0 : Math.min(currentPage * 5, totalTickets)

  return (
    <section className="student-support-layout">
      <article className="panel student-ticket-panel">
        <div className="panel-header">
          <div>
            <h2>My Tickets</h2>
            <p>Open tickets appear first, followed by in-progress, then resolved tickets.</p>
          </div>
          <span>{totalTickets === 0 ? 'No tickets' : `Showing ${visibleStart}-${visibleEnd} of ${totalTickets}`}</span>
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

        {!isLoading && !error && totalPages > 1 ? (
          <nav className="student-ticket-pagination" aria-label="Ticket pagination">
            <button
              className="ticket-pagination-button"
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="ticket-pagination-pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  className={`ticket-pagination-button${page === currentPage ? ' ticket-pagination-button-active' : ''}`}
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="ticket-pagination-button"
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </nav>
        ) : null}
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
