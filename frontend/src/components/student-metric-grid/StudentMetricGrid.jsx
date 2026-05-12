import './StudentMetricGrid.css'

export default function StudentMetricGrid({ metrics }) {
  return (
    <section className="metric-grid home-metric-grid" aria-label="Ticket summary">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className="metric-card-header">
            <span>{metric.label}</span>
            <small aria-hidden="true">{metric.icon}</small>
          </div>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </section>
  )
}
