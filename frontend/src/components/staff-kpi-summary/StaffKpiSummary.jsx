import { DashboardSkeleton, SectionError } from '../dashboard-section-state'
import './StaffKpiSummary.css'

export default function StaffKpiSummary({ cards, summary, isLoading, error, onRetry }) {
  return (
    <section className="staff-kpi-strip" aria-label="Ticket summary">
      {isLoading ? (
        <DashboardSkeleton count={6} />
      ) : error ? (
        <SectionError message="Unable to load dashboard data." onRetry={onRetry} />
      ) : (
        cards.map((card) => (
          <DashboardCard
            key={card.key}
            {...card}
            value={formatSummaryValue(summary, card.key)}
          />
        ))
      )}
    </section>
  )
}

function DashboardCard({ label, value, detail, tone }) {
  return (
    <article className={`dashboard-card dashboard-card-${tone}`}>
      <span className="card-accent" aria-hidden="true" />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <small>{detail}</small>
    </article>
  )
}

function formatSummaryValue(summary, key) {
  if (!summary) return '0'
  return summary[key] ?? '0'
}
