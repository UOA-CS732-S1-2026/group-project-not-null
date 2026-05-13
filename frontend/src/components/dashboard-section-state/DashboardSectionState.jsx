import './DashboardSectionState.css'

export function SectionError({ message, onRetry }) {
  return (
    <div className="staff-section-state" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>Retry</button>
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="staff-section-state staff-section-empty">
      <p>{message}</p>
    </div>
  )
}

export function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="staff-loading-list" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  )
}

export function DashboardSkeleton({ count }) {
  return Array.from({ length: count }).map((_, index) => (
    <article className="dashboard-card dashboard-card-loading" aria-label="Loading summary" key={index}>
      <span />
      <span />
      <span />
    </article>
  ))
}
