import { Filter, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, SectionError, SectionSkeleton } from '../dashboard-section-state'
import './StaffTicketQueue.css'

export default function StaffTicketQueue({
  tickets,
  filters,
  activeFilter,
  search,
  isLoading,
  error,
  onFilterChange,
  onSearchChange,
  onRetry,
}) {
  const navigate = useNavigate()

  return (
    <article className="staff-panel ticket-queue-panel" aria-labelledby="ticket-queue-title">
      <div className="staff-panel-heading">
        <div>
          <h2 id="ticket-queue-title">Ticket Queue</h2>
          <p>Prioritised by urgency, aging, and current assignment.</p>
        </div>
        <span>{tickets.length} visible</span>
      </div>

      <div className="ticket-toolbar">
        <div className="filter-chip-row" aria-label="Ticket status filters">
          {filters.map((chip, index) => (
            <button
              className={`filter-chip${index === activeFilter ? ' filter-chip-active' : ''}`}
              key={chip.label}
              type="button"
              onClick={() => onFilterChange(index)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="ticket-toolbar-actions">
          <label className="staff-search queue-search">
            <span>Search queue</span>
            <input
              type="search"
              placeholder="Search queue"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <button className="staff-secondary-button" type="button" onClick={onRetry}>
            <Filter size={17} aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <SectionSkeleton rows={4} />
      ) : error ? (
        <SectionError message="Unable to load tickets." onRetry={onRetry} />
      ) : tickets.length === 0 ? (
        <EmptyState message="No tickets match the current filters." />
      ) : (
        <>
          <div className="ticket-table" role="table" aria-label="Staff ticket queue">
            <div className="ticket-table-head" role="row">
              <span>Priority</span>
              <span>Ticket</span>
              <span>Student</span>
              <span>Category</span>
              <span>Status</span>
              <span>Assigned</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} onSelect={() => navigate(`/tickets/${ticket.id}`)} />
            ))}
          </div>

          <div className="mobile-ticket-list">
            {tickets.map((ticket) => (
              <MobileTicketCard key={ticket.id} ticket={ticket} onSelect={() => navigate(`/tickets/${ticket.id}`)} />
            ))}
          </div>
        </>
      )}
    </article>
  )
}

function TicketRow({ ticket, onSelect }) {
  return (
    <button className="ticket-row" type="button" role="row" aria-label={`View ${ticket.title}`} onClick={onSelect}>
      <span><PriorityBadge priority={ticket.priority} /></span>
      <strong>{ticket.title}<small>{ticket.ticketNumber}</small></strong>
      <span>{ticket.student}</span>
      <span>{ticket.category}</span>
      <span><StatusPill status={ticket.status} /></span>
      <span>{ticket.assigned}</span>
      <span>{ticket.updated}</span>
      <span className="ticket-actions" aria-label="Quick actions">
        <i>Assign</i>
        <i>Status</i>
        <MoreHorizontal size={18} aria-hidden="true" />
      </span>
    </button>
  )
}

function MobileTicketCard({ ticket, onSelect }) {
  return (
    <button className="mobile-ticket-card" type="button" aria-label={`View ${ticket.title}`} onClick={onSelect}>
      <div>
        <PriorityBadge priority={ticket.priority} />
        <StatusPill status={ticket.status} />
      </div>
      <strong>{ticket.title}</strong>
      <span>{ticket.category} · {ticket.assigned}</span>
      <small>Updated {ticket.updated}</small>
    </button>
  )
}

function PriorityBadge({ priority }) {
  return <em className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</em>
}

function StatusPill({ status }) {
  return <mark className="status-pill">{status}</mark>
}
