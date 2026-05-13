import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Main } from '../../components'
import {
  addStaffTicketNote,
  getStaffTicket,
  getStaffUsers,
  getTicket,
  updateStaffTicket,
} from '../../services/api.js'
import './ViewTicket.css'

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const categoryLabels = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance',
}

const urgencyLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const priorityLabels = {
  1: 'Critical',
  2: 'High',
  3: 'Low',
}

export default function ViewTicket() {
  const { ticketId } = useParams()
  const user = getStoredUser()
  const role = user?.role || user?.user_role
  const isStaff = role === 'staff' || role === 'admin'

  const [ticket, setTicket] = useState(null)
  const [staffUsers, setStaffUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusValue, setStatusValue] = useState('open')
  const [assignmentValue, setAssignmentValue] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [isSavingChanges, setIsSavingChanges] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadTicketDetails() {
      setError('')
      setIsLoading(true)

      try {
        const [ticketResponse, staffUsersResponse] = await Promise.all([
          isStaff ? getStaffTicket(ticketId) : getTicket(ticketId),
          isStaff ? getStaffUsers() : Promise.resolve(null),
        ])

        if (!isMounted) {
          return
        }

        hydrateTicketState(ticketResponse.ticket)
        setStaffUsers(staffUsersResponse?.users || [])
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load ticket.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    function hydrateTicketState(nextTicket) {
      setTicket(nextTicket)
      setStatusValue(nextTicket?.status || 'open')
      setAssignmentValue(nextTicket?.assignedToStaffId?._id || '')
    }

    loadTicketDetails()

    return () => {
      isMounted = false
    }
  }, [isStaff, ticketId])

  async function handleSaveChanges(event) {
    event.preventDefault()

    if (!ticket) {
      return
    }

    const updates = {}
    const currentAssignment = ticket.assignedToStaffId?._id || ''

    if (statusValue !== ticket.status) {
      updates.status = statusValue
    }

    if (assignmentValue !== currentAssignment) {
      updates.assignedToStaffId = assignmentValue || null
    }

    if (Object.keys(updates).length === 0) {
      setActionError('')
      setActionSuccess('No changes to save.')
      return
    }

    setActionError('')
    setActionSuccess('')
    setIsSavingChanges(true)

    try {
      const response = await updateStaffTicket(ticket._id, updates)
      setTicket(response.ticket)
      setStatusValue(response.ticket.status || 'open')
      setAssignmentValue(response.ticket.assignedToStaffId?._id || '')
      setActionSuccess('Ticket updated successfully.')
    } catch (err) {
      setActionError(err.message || 'Unable to update ticket.')
    } finally {
      setIsSavingChanges(false)
    }
  }

  async function handleAddNote(event) {
    event.preventDefault()

    const trimmedContent = noteContent.trim()
    if (!trimmedContent || !ticket) {
      setActionSuccess('')
      setActionError('Enter an internal note before saving.')
      return
    }

    setActionError('')
    setActionSuccess('')
    setIsSavingNote(true)

    try {
      const response = await addStaffTicketNote(ticket._id, { content: trimmedContent })
      setTicket(response.ticket)
      setNoteContent('')
      setActionSuccess('Internal note added.')
    } catch (err) {
      setActionError(err.message || 'Unable to add note.')
    } finally {
      setIsSavingNote(false)
    }
  }

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
          <Link to="/dashboard">Back to dashboard</Link>
        </section>
      </Main>
    )
  }

  const displayTicket = {
    id: ticket._id,
    ticketNumber: ticket.ticketNumber || ticket._id,
    title: ticket.title || 'Untitled ticket',
    status: formatStatus(ticket.status),
    category: formatCategory(ticket.category),
    urgency: formatUrgency(ticket.urgencyLevel),
    priority: formatPriority(ticket.priority),
    submitted: formatDate(ticket.createdAt),
    updated: formatDateTime(ticket.updatedAt),
    description: ticket.description || '',
    currentTimelineStep: formatStatus(ticket.status),
    assignedTo: getPersonName(ticket.assignedToStaffId, 'Unassigned'),
    studentName: getPersonName(ticket.studentId, 'Unknown student'),
    studentEmail: ticket.studentId?.email || 'Unknown',
    resolvedAt: ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : '',
    internalNotes: Array.isArray(ticket.internalNotes) ? ticket.internalNotes : [],
  }

  return (
    <Main className="ticket-detail-main">
      <section className="ticket-detail-header panel">
        <div className="ticket-identity">
          <div className="ticket-identity-header">
            <h1>{displayTicket.title}</h1>
            <span className={`ticket-status ticket-status-${displayTicket.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {displayTicket.status}
            </span>
          </div>
          <p>{displayTicket.category} | {displayTicket.urgency} urgency | Priority: {displayTicket.priority}</p>
          <p className="page-eyebrow">Ticket #{displayTicket.ticketNumber}</p>
          {isStaff ? (
            <p className="ticket-supporting-copy">
              Student: {displayTicket.studentName} ({displayTicket.studentEmail}) | Assigned: {displayTicket.assignedTo}
            </p>
          ) : null}
        </div>
      </section>

      <section className="ticket-detail-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Details</h2>
            <span>Updated {displayTicket.updated}</span>
          </div>

          <dl className="ticket-detail-list">
            <div>
              <dt>Status</dt>
              <dd>{displayTicket.status}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{displayTicket.category}</dd>
            </div>
            <div>
              <dt>Urgency</dt>
              <dd>{displayTicket.urgency}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{displayTicket.priority}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{displayTicket.submitted}</dd>
            </div>
            <div>
              <dt>Assigned</dt>
              <dd>{displayTicket.assignedTo}</dd>
            </div>
            {isStaff ? (
              <>
                <div>
                  <dt>Student</dt>
                  <dd>{displayTicket.studentName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{displayTicket.studentEmail}</dd>
                </div>
              </>
            ) : null}
          </dl>

          <div className="ticket-thread">
            <article className="thread-message thread-message-student">
              <div>
                <strong>Student request</strong>
                <span>{displayTicket.submitted}</span>
              </div>
              <p>{displayTicket.description}</p>
            </article>
          </div>

          {isStaff ? (
            <section className="ticket-workspace">
              <div className="panel-header">
                <h2>Staff actions</h2>
                <span>Manage assignment and progress</span>
              </div>

              <form className="ticket-action-form" onSubmit={handleSaveChanges}>
                <label className="field">
                  <span>Status</span>
                  <select className="ticket-select" value={statusValue} onChange={(event) => setStatusValue(event.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>

                <label className="field">
                  <span>Assigned staff member</span>
                  <select
                    className="ticket-select"
                    value={assignmentValue}
                    onChange={(event) => setAssignmentValue(event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staffUsers.map((staffMember) => (
                      <option key={staffMember._id} value={staffMember._id}>
                        {formatStaffOption(staffMember)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="ticket-action-buttons">
                  <button
                    className="button button-ghost"
                    type="button"
                    onClick={() => setAssignmentValue(user?._id || '')}
                  >
                    Assign to me
                  </button>
                  <button className="button button-primary" type="submit" disabled={isSavingChanges}>
                    {isSavingChanges ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>

              <form className="ticket-note-form" onSubmit={handleAddNote}>
                <label className="field create-ticket-description">
                  <span>Internal note</span>
                  <textarea
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    placeholder="Add context for other staff members."
                    rows="4"
                  />
                </label>

                <button className="button button-primary" type="submit" disabled={isSavingNote}>
                  {isSavingNote ? 'Saving note...' : 'Add internal note'}
                </button>
              </form>

              {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
              {actionSuccess ? <p className="form-success">{actionSuccess}</p> : null}
            </section>
          ) : (
            <div className="ticket-thread staff-response">
              <article className="thread-message thread-message-staff">
                <div>
                  <strong>Staff response</strong>
                  <span>{displayTicket.updated}</span>
                </div>
                <p>{getStudentFacingStatusMessage(ticket)}</p>
              </article>
            </div>
          )}
        </article>

        <aside className="panel">
          <div className="panel-header">
            <h2>{isStaff ? 'Case progress' : 'Timeline'}</h2>
            <span>{isStaff ? 'Operations' : 'Progress'}</span>
          </div>

          <ol className="ticket-timeline">
            {['Open', 'In Progress', 'Resolved'].map((step) => (
              <li className={displayTicket.currentTimelineStep === step ? 'timeline-active' : ''} key={step}>
                {step}
              </li>
            ))}
          </ol>

          {displayTicket.resolvedAt ? (
            <p className="ticket-supporting-copy">Resolved at {displayTicket.resolvedAt}</p>
          ) : null}

          {isStaff ? (
            <section className="staff-note-history">
              <div className="panel-header">
                <h2>Internal notes</h2>
                <span className="note-count-badge">{displayTicket.internalNotes.length}</span>
              </div>

              {displayTicket.internalNotes.length === 0 ? (
                <p className="ticket-supporting-copy">No internal notes have been added yet.</p>
              ) : (
                <div className="ticket-thread">
                  {displayTicket.internalNotes
                    .slice()
                    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
                    .map((note, index) => (
                      <article className="thread-message thread-message-staff" key={`${note._id || note.createdAt || index}`}>
                        <div>
                          <strong>{getPersonName(note.staffId, 'Staff')}</strong>
                          <span>{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p>{note.content}</p>
                      </article>
                    ))}
                </div>
              )}
            </section>
          ) : null}
        </aside>
      </section>

      <Link className="button button-primary" to="/dashboard">
        Back to dashboard
      </Link>
    </Main>
  )
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

function formatStatus(status) {
  return statusLabels[status] || status || 'Unknown'
}

function formatCategory(category) {
  return categoryLabels[category] || category || 'Unknown'
}

function formatUrgency(urgency) {
  return urgencyLabels[urgency] || urgency || 'Unknown'
}

function formatPriority(priority) {
  return priorityLabels[priority] || String(priority || 'Unknown')
}

function getPersonName(user, fallback) {
  if (!user) {
    return fallback
  }

  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatStaffOption(staffMember) {
  const label = getPersonName(staffMember, staffMember.email)
  return staffMember.department ? `${label} (${staffMember.department})` : label
}

function getStudentFacingStatusMessage(ticket) {
  if (ticket.status === 'resolved') {
    return 'Your request has been resolved. If you still need help, please contact support again.'
  }

  if (ticket.assignedToStaffId) {
    return `Your request is being handled by ${getPersonName(ticket.assignedToStaffId, 'a staff member')}.`
  }

  if (ticket.status === 'in_progress') {
    return 'Your request is currently being reviewed by the support team.'
  }

  return 'No staff response yet.'
}
