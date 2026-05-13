import { Link } from 'react-router-dom'
import './ArchiveList.css'

export default function ArchiveList({ tickets, isLoading, error }) {
  const fallbackTickets = [
    {
      id: 'demo-1',
      ticketNumber: 'A-1024',
      title: 'Password reset assistance',
      resolvedAt: 'Mar 4, 2026',
    },
    {
      id: 'demo-2',
      ticketNumber: 'A-1088',
      title: 'Accommodation payment follow-up',
      resolvedAt: 'Mar 10, 2026',
    },
  ]

  if (error) {
    return <p className="archive-error" role="alert">{error}</p>
  }

  if (isLoading) {
    return <p className="archive-loading">Loading archived tickets…</p>
  }

  const renderTickets = tickets && tickets.length > 0 ? tickets : fallbackTickets

  return (
    <div className="archive-grid">
      {renderTickets.map((ticket) => (
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
