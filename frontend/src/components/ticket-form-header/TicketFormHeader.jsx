import { Link } from 'react-router-dom'
import './TicketFormHeader.css'

export default function TicketFormHeader({
  title = 'Create Ticket',
  description = 'Tell us what happened so the right team can help.',
}) {
  return (
    <section className="ticket-form-header">
      <nav aria-label="Breadcrumb" className="ticket-form-breadcrumbs">
        <Link to="/dashboard">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <span>Create Ticket</span>
      </nav>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}
