import './TicketFormHeader.css'

export default function TicketFormHeader({
  title = 'Create Ticket',
  description = 'Tell us what happened so the right team can help.',
}) {
  return (
    <section className="ticket-form-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}
