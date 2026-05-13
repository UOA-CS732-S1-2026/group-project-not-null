import { BarChart3, PieChart } from 'lucide-react'
import { EmptyState, SectionError, SectionSkeleton } from '../dashboard-section-state'
import './StaffAnalyticsSection.css'

export default function StaffAnalyticsSection({
  categoryBars,
  statusStats,
  isLoading,
  error,
  onRetry,
}) {
  return (
    <section className="analytics-grid" aria-label="Ticket analytics">
      <article className="staff-panel chart-panel">
        <div className="staff-panel-heading">
          <div>
            <h2>Tickets by Category</h2>
            <p>Current week intake.</p>
          </div>
          <BarChart3 size={20} aria-hidden="true" />
        </div>
        {isLoading ? (
          <SectionSkeleton rows={4} />
        ) : error ? (
          <SectionError message="Unable to load dashboard data." onRetry={onRetry} />
        ) : categoryBars.length === 0 ? (
          <EmptyState message="No category analytics yet." />
        ) : (
          <div className="bar-chart" aria-hidden="true">
            {categoryBars.map((item) => (
              <div className="bar-row" key={item.name}>
                <span>{item.name === 'Accommodation/Finance' ? 'Accommodation' : item.name}</span>
                <div><i style={{ width: `${item.percent}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="staff-panel chart-panel compact-mobile-analytics">
        <div className="staff-panel-heading">
          <div>
            <h2>Tickets by Status</h2>
            <p>Live operational split.</p>
          </div>
          <PieChart size={20} aria-hidden="true" />
        </div>
        {isLoading ? (
          <SectionSkeleton rows={3} />
        ) : error ? (
          <SectionError message="Unable to load dashboard data." onRetry={onRetry} />
        ) : statusStats.length === 0 ? (
          <EmptyState message="No status analytics yet." />
        ) : (
          <div className="status-chart">
            <div className="doughnut-placeholder" style={getDoughnutStyle(statusStats)} aria-hidden="true" />
            <div className="status-legend">
              {statusStats.map((item) => (
                <span key={item.name}><i />{item.name} <strong>{item.value}</strong></span>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

function getDoughnutStyle(items = []) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) return undefined

  const first = Math.round(((items[0]?.value || 0) / total) * 100)
  const second = first + Math.round(((items[1]?.value || 0) / total) * 100)

  return {
    background: `conic-gradient(var(--blue-900) 0 ${first}%, var(--blue-700) ${first}% ${second}%, var(--border) ${second}% 100%)`,
  }
}
