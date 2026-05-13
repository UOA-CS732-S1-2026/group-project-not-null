import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AttachmentPreviewModal, Main } from '../../components'
import {
  addStaffTicketNote,
  addStaffTicketStudentNote,
  assignTicket,
  getAdminAllStaff,
  getStaffTicket,
  getStaffUsers,
  getTicket,
  getTicketAttachmentBlob,
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
  const isAdmin = role === 'admin'
  const isStaff = role === 'staff' || role === 'admin'

  const [ticket, setTicket] = useState(null)
  const [staffUsers, setStaffUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusValue, setStatusValue] = useState('open')
  const [assignmentValue, setAssignmentValue] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [studentNoteContent, setStudentNoteContent] = useState('')
  const [isResolvingComment, setIsResolvingComment] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [isSavingChanges, setIsSavingChanges] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isSavingStudentNote, setIsSavingStudentNote] = useState(false)
  const [selectedDept, setSelectedDept] = useState('')
  const [pendingStaffId, setPendingStaffId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState('')
  const [isAttachmentLoading, setIsAttachmentLoading] = useState(false)
  const [attachmentLoadError, setAttachmentLoadError] = useState('')
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadTicketDetails() {
      setError('')
      setIsLoading(true)

      try {
        const [ticketResponse, staffUsersResponse] = await Promise.all([
          isStaff ? getStaffTicket(ticketId) : getTicket(ticketId),
          isAdmin ? getAdminAllStaff({ status: 'active' }) : isStaff ? getStaffUsers() : Promise.resolve(null),
        ])

        if (!isMounted) {
          return
        }

        hydrateTicketState(ticketResponse.ticket)
        setStaffUsers(staffUsersResponse?.users || staffUsersResponse?.staff || [])
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
  }, [isAdmin, isStaff, ticketId])

  useEffect(() => {
    let isMounted = true
    let nextObjectUrl = ''

    if (!ticket?.attachment?.gridFsFileId) {
      setAttachmentLoadError('')
      setIsAttachmentLoading(false)
      setAttachmentPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }

        return ''
      })
      return undefined
    }

    async function loadAttachmentPreview() {
      setAttachmentLoadError('')
      setIsAttachmentLoading(true)

      try {
        const blob = await getTicketAttachmentBlob(ticket._id)

        if (!isMounted) {
          return
        }

        nextObjectUrl = URL.createObjectURL(blob)
        setAttachmentPreviewUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl)
          }

          return nextObjectUrl
        })
      } catch (err) {
        if (isMounted) {
          setAttachmentLoadError(err.message || 'Unable to load the attachment preview.')
          setAttachmentPreviewUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl)
            }

            return ''
          })
        }
      } finally {
        if (isMounted) {
          setIsAttachmentLoading(false)
        }
      }
    }

    loadAttachmentPreview()

    return () => {
      isMounted = false

      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl)
      }
    }
  }, [ticket?._id, ticket?.attachment?.gridFsFileId])

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

    if (updates.status === 'resolved' && !hasResolvingStudentNote(ticket)) {
      setActionSuccess('')
      setActionError('Add a student note marked as the resolving comment before resolving this ticket.')
      return
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

  async function handleAddStudentNote(event) {
    event.preventDefault()

    const trimmedContent = studentNoteContent.trim()
    if (!trimmedContent || !ticket) {
      setActionSuccess('')
      setActionError('Enter a student note before saving.')
      return
    }

    setActionError('')
    setActionSuccess('')
    setIsSavingStudentNote(true)

    try {
      const response = await addStaffTicketStudentNote(ticket._id, {
        content: trimmedContent,
        isResolvingComment,
      })
      setTicket(response.ticket)
      setStatusValue(response.ticket.status || 'open')
      setAssignmentValue(response.ticket.assignedToStaffId?._id || '')
      setStudentNoteContent('')
      setIsResolvingComment(false)
      setActionSuccess('Student note added.')
    } catch (err) {
      setActionError(err.message || 'Unable to add student note.')
    } finally {
      setIsSavingStudentNote(false)
    }
  }

  async function handleReopenTicket() {
    if (!ticket) {
      return
    }

    setActionError('')
    setActionSuccess('')
    setIsSavingChanges(true)

    try {
      const response = await updateStaffTicket(ticket._id, { status: 'open' })
      setTicket(response.ticket)
      setStatusValue(response.ticket.status || 'open')
      setAssignmentValue(response.ticket.assignedToStaffId?._id || '')
      setActionSuccess('Ticket re-opened successfully.')
    } catch (err) {
      setActionError(err.message || 'Unable to re-open ticket.')
    } finally {
      setIsSavingChanges(false)
    }
  }

  async function handleAdminAssign(staffId) {
    setIsAssigning(true)
    setAssignError('')
    try {
      const response = await assignTicket(ticket._id, staffId)
      setTicket(response.ticket)
      setSelectedDept('')
      setPendingStaffId('')
    } catch (err) {
      setAssignError(err.message || 'Unable to assign ticket.')
    } finally {
      setIsAssigning(false)
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
    studentNotes: Array.isArray(ticket.studentNotes) ? ticket.studentNotes : [],
    attachment: ticket.attachment || null,
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
              Student: {displayTicket.studentName} ({displayTicket.studentEmail})
            </p>
          ) : null}
        </div>
      </section>

      <section className="ticket-detail-grid">
        {ticket.status === 'resolved' ? (
          <section className="resolved-ticket-info">
            <div>
              <h2>This ticket was resolved</h2>
              <p>
                {displayTicket.resolvedAt
                  ? `Resolved at ${displayTicket.resolvedAt}.`
                  : 'The support team has marked this ticket as resolved.'}
              </p>
            </div>
            {isStaff ? (
              <button
                className="button button-ghost resolved-ticket-action"
                type="button"
                disabled={isSavingChanges}
                onClick={handleReopenTicket}
              >
                {isSavingChanges ? 'Re-opening...' : 'Re-open ticket'}
              </button>
            ) : null}
          </section>
        ) : null}

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
              {displayTicket.attachment ? (
                <section className="ticket-attachment-card">
                  <div className="ticket-attachment-summary">
                    <button
                      className="ticket-attachment-trigger"
                      disabled={isAttachmentLoading || Boolean(attachmentLoadError)}
                      type="button"
                      onClick={() => setIsAttachmentPreviewOpen(true)}
                    >
                      {attachmentPreviewUrl ? (
                        <img
                          alt=""
                          className="ticket-attachment-thumb"
                          src={attachmentPreviewUrl}
                        />
                      ) : (
                        <span aria-hidden="true" className="ticket-attachment-icon" />
                      )}

                      <span className="ticket-attachment-copy">
                        <strong>Attachment</strong>
                        <span>{displayTicket.attachment.fileName}</span>
                        <small>{formatFileSize(displayTicket.attachment.sizeBytes)}</small>
                      </span>
                    </button>

                    <div className="ticket-attachment-actions">
                      <button
                        className="button button-primary"
                        disabled={isAttachmentLoading || Boolean(attachmentLoadError)}
                        type="button"
                        onClick={() => setIsAttachmentPreviewOpen(true)}
                      >
                        {isAttachmentLoading ? 'Loading preview...' : 'Preview image'}
                      </button>
                    </div>
                  </div>

                  {attachmentLoadError ? (
                    <p className="form-error" role="alert">{attachmentLoadError}</p>
                  ) : null}
                </section>
              ) : null}
            </article>

            {displayTicket.studentNotes
              .slice()
              .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
              .map((note, index) => (
                <article className="thread-message thread-message-staff" key={`${note._id || note.createdAt || index}`}>
                  <div>
                    <strong>
                      {note.isResolvingComment ? 'Resolving comment' : 'Staff note'}
                    </strong>
                    <span>{formatDateTime(note.createdAt)}</span>
                  </div>
                  <p>{note.content}</p>
                </article>
              ))}
          </div>

          {isStaff ? (
            <>
              <section className="staff-note-history staff-note-history-mobile">
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

              <section className="ticket-workspace">
                <div className="panel-header">
                  <h2>Staff actions</h2>
                </div>

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

                <form className="ticket-note-form" onSubmit={handleAddStudentNote}>
                  <label className="field create-ticket-description">
                    <span>Student note</span>
                    <textarea
                      value={studentNoteContent}
                      onChange={(event) => setStudentNoteContent(event.target.value)}
                      placeholder="Add an update the student can see."
                      rows="4"
                    />
                  </label>

                  <label className="ticket-checkbox-field">
                    <input
                      type="checkbox"
                      checked={isResolvingComment}
                      onChange={(event) => setIsResolvingComment(event.target.checked)}
                    />
                    <span>Is this the Resolving Comment?</span>
                  </label>

                  <button className="button button-primary" type="submit" disabled={isSavingStudentNote}>
                    {isSavingStudentNote ? 'Saving note...' : 'Add Student note'}
                  </button>
                </form>

                <section className="ticket-status-controls">
                  <div className="panel-header">
                    <h2>Status</h2>
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

                    <div className="ticket-action-buttons">
                      <button className="button button-primary" type="submit" disabled={isSavingChanges}>
                        {isSavingChanges ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                </section>

                {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
                {actionSuccess ? <p className="form-success">{actionSuccess}</p> : null}
              </section>

              {isAdmin ? (
                <section className="ticket-workspace">
                  <div className="panel-header">
                    <h2>Assign ticket</h2>
                  </div>

                  <div className="admin-assign-widget">
                    <p className="ticket-supporting-copy">
                      Current assignee: <strong>{displayTicket.assignedTo}</strong>
                    </p>

                    {staffUsers.length === 0 ? (
                      <p className="ticket-supporting-copy">No active staff available.</p>
                    ) : (() => {
                      const deptMap = staffUsers.reduce((acc, m) => {
                        const dept = m.department || 'Other'
                        ;(acc[dept] = acc[dept] || []).push(m)
                        return acc
                      }, {})
                      const depts = Object.keys(deptMap).sort()
                      const deptMembers = selectedDept ? (deptMap[selectedDept] || []) : []
                      return (
                        <>
                          <label className="field">
                            <span>Department</span>
                            <select
                              className="ticket-select"
                              value={selectedDept}
                              onChange={(e) => { setSelectedDept(e.target.value); setPendingStaffId('') }}
                            >
                              <option value="">Select a department</option>
                              {depts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </label>

                          {selectedDept && (
                            <label className="field">
                              <span>Staff member</span>
                              <select
                                className="ticket-select"
                                value={pendingStaffId}
                                disabled={isAssigning}
                                onChange={(e) => setPendingStaffId(e.target.value)}
                              >
                                <option value="">Select staff member</option>
                                {deptMembers.map((member) => (
                                  <option key={member._id} value={member._id}>
                                    {getPersonName(member, member.email)}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}

                        </>
                      )
                    })()}

                    {(pendingStaffId || ticket.assignedToStaffId) ? (
                      <div className="assign-action-row">
                        {pendingStaffId ? (
                          <button
                            type="button"
                            className="button button-primary"
                            disabled={isAssigning}
                            onClick={() => handleAdminAssign(pendingStaffId)}
                          >
                            {isAssigning ? 'Assigning...' : 'Assign'}
                          </button>
                        ) : null}
                        {ticket.assignedToStaffId ? (
                          <button
                            type="button"
                            className="button button-ghost"
                            disabled={isAssigning}
                            onClick={() => handleAdminAssign(null)}
                          >
                            Unassign
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    {assignError ? <p className="form-error" role="alert">{assignError}</p> : null}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="ticket-thread staff-response">
              {displayTicket.studentNotes.length === 0 ? (
                <article className="thread-message thread-message-staff">
                  <div>
                    <strong>Staff response</strong>
                    <span>{displayTicket.updated}</span>
                  </div>
                  <p>{getStudentFacingStatusMessage(ticket)}</p>
                </article>
              ) : null}
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
            <section className="staff-note-history staff-note-history-desktop">
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

      <Link className="button button-primary" to={isAdmin ? '/admin/tickets' : '/dashboard'}>
        {isAdmin ? 'Back to tickets' : 'Back to dashboard'}
      </Link>

      <AttachmentPreviewModal
        error={attachmentLoadError}
        fileName={displayTicket.attachment?.fileName}
        fileSizeLabel={displayTicket.attachment ? formatFileSize(displayTicket.attachment.sizeBytes) : ''}
        imageUrl={attachmentPreviewUrl}
        isLoading={isAttachmentLoading}
        isOpen={isAttachmentPreviewOpen}
        onClose={() => setIsAttachmentPreviewOpen(false)}
      />
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


function hasResolvingStudentNote(ticket) {
  return Array.isArray(ticket?.studentNotes)
    && ticket.studentNotes.some((note) => note?.isResolvingComment)
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

function formatFileSize(sizeBytes) {
  if (!sizeBytes) {
    return '0 KB'
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}
