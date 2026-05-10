import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Main } from '../../components'
import { getTicket } from '../../services/api.js'
import { formatTicket } from '../../services/ticket-mappers.js'
import './ViewTicket.css'

export default function ViewTicket() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadTicket() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getTicket(ticketId)

        if (isMounted) {
          setTicket(formatTicket(data.ticket))
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTicket()

    return () => {
      isMounted = false
    }
  }, [ticketId])

  if (isLoading) {
    return (
        <Main>
          <section className="panel">
            <h1>Loading ticket...</h1>
          </section>
        </Main>
    )
  }

  if (error || !ticket) {
    return (
        <Main>
          <section className="panel">
            <h1>Ticket not found</h1>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Link to="/home">Back to My Support</Link>
          </section>
        </Main>
    )
  }

  return (
      <Main className="ticket-detail-main">
        <section className="ticket-detail-header panel">
          <div>
            <h1>{ticket.title}</h1>
            <p>{ticket.category} · {ticket.urgency} urgency · Priority: {ticket.priority}</p>
            <p className="page-eyebrow">Ticket #{ticket.ticketNumber || ticket.id}</p>
          </div>
          <span className={`ticket-status ticket-status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
            {ticket.status}
          </span>
        </section>

        <section className="ticket-detail-grid">
          <article className="panel">
            <div className="panel-header">
              <h2>Details</h2>
              <span>Updated {ticket.updated}</span>
            </div>
            <dl className="ticket-detail-list">
              <div><dt>Status</dt><dd>{ticket.status}</dd></div>
              <div><dt>Category</dt><dd>{ticket.category}</dd></div>
              <div><dt>Urgency</dt><dd>{ticket.urgency}</dd></div>
              <div><dt>Priority</dt><dd>{ticket.priority}</dd></div>
              <div><dt>Submitted</dt><dd>{ticket.submitted}</dd></div>
            </dl>
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </article>

          <aside className="panel">
            <div className="panel-header">
              <h2>Timeline</h2>
              <span>Progress</span>
            </div>
            <ol className="ticket-timeline">
              {['Open', 'In Progress', 'Resolved'].map((step) => (
                <li
                  className={ticket.timeline.includes(step) ? 'timeline-active' : ''}
                  key={step}
                >
                  {step}
                </li>
              ))}
            </ol>
            <div className="staff-response">
              <h3>Staff response</h3>
              <p>{ticket.staffResponse || 'No staff response yet.'}</p>
            </div>
          </aside>
        </section>

        <Link className="button button-primary" to="/home">
          Back to My Support
        </Link>
      </Main>
  )
}
