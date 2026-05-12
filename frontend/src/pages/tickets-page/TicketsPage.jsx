import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Main } from '../../components'
import { getStaffTickets, updateStaffTicket } from '../../services/api'
import { formatStaffTicket } from '../../services/ticket-mappers'
import './TicketsPage.css'

const COLUMNS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
]

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggingId, setDraggingId] = useState(null)

  const loadTickets = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      const data = await getStaffTickets({ assignedTo: 'me', limit: 100 })
      setTickets((data.tickets || []).map(formatStaffTicket))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  async function handleDrop(targetStatus) {
    const id = draggingId
    const ticket = tickets.find(t => t.id === id)
    if (!ticket || ticket.statusValue === targetStatus) return

    setDraggingId(null)
    setTickets(prev =>
      prev.map(t => t.id === id ? { ...t, statusValue: targetStatus } : t)
    )

    try {
      await updateStaffTicket(id, { status: targetStatus })
    } catch {
      loadTickets()
    }
  }

  if (error) {
    return (
      <Main className="tickets-main">
        <div className="kanban-error">
          <p>{error}</p>
          <button type="button" onClick={loadTickets}>Retry</button>
        </div>
      </Main>
    )
  }

  return (
    <Main className="tickets-main">
      <header className="kanban-header">
        <div>
          <h1>My Tickets</h1>
          <p>Drag cards between columns to update ticket status.</p>
        </div>
        <span className="kanban-total">{tickets.length} assigned</span>
      </header>
      <div className="kanban-board">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.key}
            col={col}
            tickets={tickets.filter(t => t.statusValue === col.key)}
            isLoading={isLoading}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDrop={handleDrop}
            onCardClick={id => navigate(`/tickets/${id}`)}
          />
        ))}
      </div>
    </Main>
  )
}

function KanbanColumn({ col, tickets, isLoading, draggingId, onDragStart, onDrop, onCardClick }) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={`kanban-column kanban-col-${col.key.replace('_', '-')}${isDragOver ? ' kanban-drop-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false) }}
      onDrop={() => { setIsDragOver(false); onDrop(col.key) }}
    >
      <div className="kanban-col-head">
        <span className="kanban-col-label">{col.label}</span>
        {!isLoading && <span className="kanban-col-count">{tickets.length}</span>}
      </div>
      <div className="kanban-cards">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="kanban-skeleton" />)
          : tickets.length === 0
            ? <p className="kanban-empty">No tickets here</p>
            : tickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isDragging={draggingId === ticket.id}
                  onDragStart={() => onDragStart(ticket.id)}
                  onDragEnd={() => onDragStart(null)}
                  onClick={() => onCardClick(ticket.id)}
                />
              ))
        }
      </div>
    </div>
  )
}

function TicketCard({ ticket, isDragging, onDragStart, onDragEnd, onClick }) {
  return (
    <div
      className={`kanban-card${isDragging ? ' kanban-card-dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="kanban-card-top">
        <em className={`kanban-priority kanban-priority-${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </em>
        <span className="kanban-ticket-number">{ticket.ticketNumber}</span>
      </div>
      <p className="kanban-card-title">{ticket.title}</p>
      <div className="kanban-card-meta">
        <span>{ticket.category}</span>
        <span>{ticket.student}</span>
      </div>
      <small className="kanban-card-time">{ticket.updated}</small>
    </div>
  )
}
