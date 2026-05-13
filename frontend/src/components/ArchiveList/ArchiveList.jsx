import { Link } from 'react-router-dom'
import './ArchiveList.css'

export default function ArchiveList({ tickets, isLoading, error }) {
  if (error) {
    return <p className="archive-error" role="alert">{error}</p>
  }

  if (isLoading) {
    return (
      <div className="archive-grid" aria-label="Loading archived tickets">
        {[1, 2].map((item) => (
          <article className="archive-card archive-card-loading" key={item}>
            <span />
            <strong />
            <p />
          </article>
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <section className="archive-empty">
        <h2>No archived tickets</h2>
        <p>Resolved tickets will appear here after they are archived.</p>
      </section>
    )
  }

  return (
    <div className="archive-grid">
      {tickets.map((ticket) => (
        <ArchiveCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

function ArchiveCard({ ticket }) {
  return (
    <article className="archive-card">
      <span className="archive-ticket-id">#{ticket.ticketNumber}</span>
      <h2>{ticket.title}</h2>
      <p>Original resolution date: {ticket.resolvedAt}</p>
      <Link className="button button-ghost archive-history-button" to={`/tickets/${ticket.id}`}>
        View History
      </Link>
    </article>
  )
}
