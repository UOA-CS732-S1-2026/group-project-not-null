import { useState, useEffect, useCallback } from 'react'
import {
  getAdminPendingStaff,
  getAdminAllStaff,
  getAdminUsers,
  approveStaff,
  rejectStaff,
  updateStaffStatus,
  promoteStaff,
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
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [pendingError, setPendingError] = useState('')
  const [staffError, setStaffError] = useState('')
  const [adminsError, setAdminsError] = useState('')
  const [actionError, setActionError] = useState('')
  const [admins, setAdmins] = useState([])

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

  const loadAdmins = useCallback(() => {
    setAdminsLoading(true)
    setAdminsError('')
    getAdminUsers({ role: 'admin' })
      .then((data) => setAdmins(data.users))
      .catch((err) => setAdminsError(err.message))
      .finally(() => setAdminsLoading(false))
  }, [])

  useEffect(() => {
    loadPending()
    loadAllStaff()
    loadAdmins()
  }, [loadPending, loadAllStaff, loadAdmins])

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

  async function handlePromote(id) {
    if (!window.confirm('Promote this staff member to admin? This cannot be undone.')) return
    setActionError('')
    try {
      await promoteStaff(id)
      loadAllStaff()
      loadAdmins()
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
          <div className="admin-table-wrap"><table className="admin-table">
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
                  <td>
                    <div className="admin-table-actions">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
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
          <div className="admin-table-wrap"><table className="admin-table">
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
                  <td>
                    <div className="admin-table-actions">
                      {(member.staffStatus === 'active' || member.staffStatus === 'inactive') && (
                        <button
                          type="button"
                          className={`admin-btn ${member.staffStatus === 'active' ? 'admin-btn-deactivate' : 'admin-btn-approve'}`}
                          onClick={() => handleToggleStatus(member._id, member.staffStatus)}
                        >
                          {member.staffStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {member.staffStatus === 'active' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-promote"
                          onClick={() => handlePromote(member._id)}
                        >
                          Promote to Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
      {/* Admins */}
      <section className="admin-section" aria-labelledby="admins-heading">
        <h2 id="admins-heading">Admins</h2>

        {adminsLoading && <p className="admin-loading">Loading...</p>}
        {adminsError && (
          <p className="admin-section-error" role="alert">
            {adminsError}{' '}
            <button type="button" onClick={loadAdmins}>Retry</button>
          </p>
        )}

        {!adminsLoading && !adminsError && admins.length === 0 && (
          <p className="admin-empty">No admins found.</p>
        )}

        {!adminsLoading && admins.length > 0 && (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u._id}>
                  <td>{`${u.firstName} ${u.lastName}`}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  )
}
