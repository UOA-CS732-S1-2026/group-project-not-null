import { CheckCircle2 } from 'lucide-react'
import './StaffAssigner.css'

export default function StaffAssigner({
  isOpen,
  staffByDept,
  selectedStaffId,
  selectedStaffName,
  isAssigning,
  successMessage,
  errorMessage,
  onSelectStaff,
  onConfirm,
}) {
  const departments = Object.entries(staffByDept || {})

  return (
    <section className={`staff-assigner${isOpen ? ' staff-assigner-open' : ''}`} aria-hidden={!isOpen}>
      <div className="staff-assigner-inner">
        <div className="staff-assigner-grid">
          {departments.length > 0 ? (
            departments.map(([department, staffMembers]) => {
              const selectedInDepartment = staffMembers.some((staffMember) => staffMember.id === selectedStaffId)

              return (
                <label className="staff-assigner-field" key={department}>
                  <span>{department}</span>
                  <select
                    disabled={!isOpen}
                    value={selectedInDepartment ? selectedStaffId : ''}
                    onChange={(event) => onSelectStaff(event.target.value, staffMembers)}
                  >
                    <option value="">Select staff member</option>
                    {staffMembers.map((staffMember) => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </option>
                    ))}
                  </select>
                </label>
              )
            })
          ) : (
            <p className="staff-assigner-empty">No active department staff are available.</p>
          )}
        </div>

        {selectedStaffId ? (
          <button
            className="button button-primary staff-assigner-confirm"
            type="button"
            disabled={isAssigning}
            onClick={onConfirm}
          >
            {isAssigning ? 'Assigning...' : `Confirm Assignment${selectedStaffName ? ` to ${selectedStaffName}` : ''}`}
          </button>
        ) : null}

        {successMessage ? (
          <p className="staff-assigner-success" role="status">
            <CheckCircle2 size={16} aria-hidden="true" />
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="staff-assigner-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  )
}
