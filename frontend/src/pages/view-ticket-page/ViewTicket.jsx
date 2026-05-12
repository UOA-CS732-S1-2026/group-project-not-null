import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Main } from '../../components'
import { getTicket } from '../../services/api.js'
import { formatTicket } from '../../services/ticket-mappers.js'
import { studentTickets } from '../dashboard-page/tickets/ticketData.js'
import './ViewTicket.css'

// Helper to check if a value is a React element/component
function isReactElement(value) {
  return value && typeof value === 'object' && '$$typeof' in value
}

// Safely extract string value, filtering out React elements
function getSafeString(value) {
  if (isReactElement(value)) {
    console.warn('Filtered out React element:', value)
    return ''
  }
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
}

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
          const formatted = formatTicket(data.ticket)
          console.log('Formatted ticket from API:', formatted)
          setTicket(formatted)
        }
      } catch (err) {
        // Fallback to mock data for development
        if (isMounted) {
          const mockTicket = studentTickets.find((t) => t.id === ticketId)
          if (mockTicket) {
            console.log('Using mock ticket:', mockTicket)
            setTicket(mockTicket)
          } else {
            console.error('Ticket not found:', ticketId, 'Available IDs:', studentTickets.map(t => t.id))
            setError(err.message)
          }
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
            <Link to="/dashboard">Back to My Support</Link>
          </section>
        </Main>
    )
  }

  // Safety check: ensure all required fields are safe strings, filtering out React elements
  const safeTicket = {
    title: getSafeString(ticket.title),
    status: getSafeString(ticket.status),
    category: getSafeString(ticket.category),
    urgency: getSafeString(ticket.urgency),
    priority: getSafeString(ticket.priority),
    id: getSafeString(ticket.id),
    ticketNumber: getSafeString(ticket.ticketNumber || ticket.id),
    submitted: getSafeString(ticket.submitted),
    updated: getSafeString(ticket.updated),
    description: getSafeString(ticket.description),
    staffResponse: getSafeString(ticket.staffResponse),
    timeline: Array.isArray(ticket.timeline) ? ticket.timeline.map(getSafeString) : [],
  }

  console.log('Safe ticket prepared:', safeTicket)

  return (
      <Main className="ticket-detail-main">
        <section className="ticket-detail-header panel">
          <div className="ticket-identity">
            <div className="ticket-identity-header">
              <h1>{safeTicket.title}</h1>
              <span className={`ticket-status ticket-status-${safeTicket.status.toLowerCase().replace(' ', '-')}`}>
                {safeTicket.status}
              </span>
            </div>
            <p>{safeTicket.category} · {safeTicket.urgency} urgency · Priority: {safeTicket.priority}</p>
            <p className="page-eyebrow">Ticket #{safeTicket.ticketNumber}</p>
          </div>
        </section>

        <section className="ticket-detail-grid">
          <article className="panel">
            <div className="panel-header">
              <h2>Details</h2>
              <span>Updated {safeTicket.updated}</span>
            </div>
            <dl className="ticket-detail-list">
              <div><dt>Status</dt><dd>{safeTicket.status}</dd></div>
              <div><dt>Category</dt><dd>{safeTicket.category}</dd></div>
              <div><dt>Urgency</dt><dd>{safeTicket.urgency}</dd></div>
              <div><dt>Priority</dt><dd>{safeTicket.priority}</dd></div>
              <div><dt>Submitted</dt><dd>{safeTicket.submitted}</dd></div>
            </dl>
            <div className="ticket-thread">
              <article className="thread-message thread-message-student">
                <div>
                  <strong>Student request</strong>
                  <span>{safeTicket.submitted}</span>
                </div>
                <p>{safeTicket.description}</p>
              </article>
            </div>
          </article>

          <aside className="panel">
            <div className="panel-header">
              <h2>Timeline</h2>
              <span>Progress</span>
            </div>
            <ol className="ticket-timeline">
              {['Open', 'In Progress', 'Resolved'].map((step) => (
                <li
                  className={safeTicket.timeline.includes(step) ? 'timeline-active' : ''}
                  key={step}
                >
                  {step}
                </li>
              ))}
            </ol>
            <div className="ticket-thread staff-response">
              <article className="thread-message thread-message-staff">
                <div>
                  <strong>Staff response</strong>
                  <span>{safeTicket.updated}</span>
                </div>
                <p>{safeTicket.staffResponse || 'No staff response yet.'}</p>
              </article>
            </div>
          </aside>
        </section>

        <Link className="button button-primary" to="/dashboard">
          Back to My Support
        </Link>
      </Main>
  )
}
