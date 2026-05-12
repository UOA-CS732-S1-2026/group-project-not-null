import { useState, useEffect, useCallback } from 'react'
import {
  getAdminPendingStaff,
  getAdminAllStaff,
  approveStaff,
  rejectStaff,
  updateStaffStatus,
} from '../../services/api'
import './admin-page.css'

function StatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-${status ?? 'unknown'}`}>
      {status ?? 'legacy'}
    </span>
  )
}

export default function AdminPage() {
  const [pending, setPending] = useState([])
  const [allStaff, setAllStaff] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [staffLoading, setStaffLoading] = useState(true)
  const [pendingError, setPendingError] = useState('')
  const [staffError, setStaffError] = useState('')
  const [actionError, setActionError] = useState('')

  const loadPending = useCallback(() => {
    setPendingLoading(true)
    setPendingError('')
    getAdminPendingStaff()
      .then((data) => setPending(data.staff))
      .catch((err) => setPendingError(err.message))
      .finally(() => setPendingLoading(false))
  }, [])

  const loadAllStaff = useCallback(() => {
    setStaffLoading(true)
    setStaffError('')
    getAdminAllStaff()
      .then((data) => setAllStaff(data.staff))
      .catch((err) => setStaffError(err.message))
      .finally(() => setStaffLoading(false))
  }, [])

  useEffect(() => {
    loadPending()
    loadAllStaff()
  }, [loadPending, loadAllStaff])

  async function handleApprove(id) {
    setActionError('')
    try {
      await approveStaff(id)
      loadPending()
      loadAllStaff()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleReject(id) {
    setActionError('')
    try {
      await rejectStaff(id)
      loadPending()
      loadAllStaff()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleToggleStatus(id, currentStatus) {
    setActionError('')
    const next = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await updateStaffStatus(id, next)
      loadAllStaff()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Admin Panel</h1>
        <p>Manage staff accounts and access requests.</p>
      </header>

      {actionError && (
        <p className="admin-action-error" role="alert">
          {actionError}
        </p>
      )}

      {/* Pending Staff Requests */}
      <section className="admin-section" aria-labelledby="pending-heading">
        <h2 id="pending-heading">Pending Staff Requests</h2>

        {pendingLoading && <p className="admin-loading">Loading...</p>}
        {pendingError && (
          <p className="admin-section-error" role="alert">
            {pendingError}{' '}
            <button type="button" onClick={loadPending}>
              Retry
            </button>
          </p>
        )}

        {!pendingLoading && !pendingError && pending.length === 0 && (
          <p className="admin-empty">No pending requests.</p>
        )}

        {!pendingLoading && pending.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((member) => (
                <tr key={member._id}>
                  <td>{`${member.firstName} ${member.lastName}`}</td>
                  <td>{member.email}</td>
                  <td>{member.department || '—'}</td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-approve"
                      onClick={() => handleApprove(member._id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-reject"
                      onClick={() => handleReject(member._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* All Staff */}
      <section className="admin-section" aria-labelledby="staff-heading">
        <h2 id="staff-heading">All Staff</h2>

        {staffLoading && <p className="admin-loading">Loading...</p>}
        {staffError && (
          <p className="admin-section-error" role="alert">
            {staffError}{' '}
            <button type="button" onClick={loadAllStaff}>
              Retry
            </button>
          </p>
        )}

        {!staffLoading && !staffError && allStaff.length === 0 && (
          <p className="admin-empty">No staff members found.</p>
        )}

        {!staffLoading && allStaff.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allStaff.map((member) => (
                <tr key={member._id}>
                  <td>{`${member.firstName} ${member.lastName}`}</td>
                  <td>{member.email}</td>
                  <td>{member.department || '—'}</td>
                  <td>
                    <StatusBadge status={member.staffStatus} />
                  </td>
                  <td className="admin-table-actions">
                    {(member.staffStatus === 'active' || member.staffStatus === 'inactive') && (
                      <button
                        type="button"
                        className={`admin-btn ${member.staffStatus === 'active' ? 'admin-btn-deactivate' : 'admin-btn-approve'}`}
                        onClick={() => handleToggleStatus(member._id, member.staffStatus)}
                      >
                        {member.staffStatus === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
