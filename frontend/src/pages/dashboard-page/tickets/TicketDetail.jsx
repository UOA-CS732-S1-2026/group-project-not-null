import { Link, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header.jsx'
import { Main } from '../../components/layout/Main.jsx'
import { TopNav } from '../../components/layout/TopNav.jsx'
import { studentTickets } from './ticketData.js'

const topNav = [
  { title: 'Home', href: '/home' },
  { title: 'Tickets', href: '/tickets' },
  { title: 'Create Ticket', href: '/tickets/new' },
]

export default function TicketDetail() {
  const { ticketId } = useParams()
  const ticket = studentTickets.find((item) => item.id === ticketId)

  if (!ticket) {
    return (
      <>
        <Header>
          <TopNav links={topNav} />
        </Header>
        <Main>
          <section className="panel">
            <h1>Ticket not found</h1>
            <Link to="/home">Back to My Support</Link>
          </section>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
      </Header>
      <Main className="ticket-detail-main">
        <section className="ticket-detail-header panel">
          <div>
            <p className="page-eyebrow">Ticket #{ticket.id}</p>
            <h1>{ticket.title}</h1>
            <p>{ticket.category} · {ticket.urgency} urgency · Priority: {ticket.priority}</p>
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
      </Main>
    </>
  )
}
