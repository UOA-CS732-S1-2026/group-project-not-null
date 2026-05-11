import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  CheckCheck,
  CircleAlert,
  Clock3,
  Ellipsis,
  Filter,
  Home,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Square,
  TicketCheck,
  UserCircle2,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Main } from '../../components'
import { getTickets } from '../../services/api.js'
import { formatTicket, ticketCategories } from '../../services/ticket-mappers.js'
import './Dashboard.css'

const staffName = 'Anna'

const kpis = [
  { label: 'Open Tickets', value: 42, detail: '+8 since yesterday', tone: 'critical' },
  { label: 'In Progress', value: 18, detail: '6 updated this hour', tone: 'medium' },
  { label: 'Resolved Today', value: 27, detail: 'Strong morning close rate', tone: 'low' },
  { label: 'High Priority', value: 9, detail: 'Needs same-day response', tone: 'high' },
  { label: 'Assigned to Me', value: 14, detail: '4 waiting on staff', tone: 'steel' },
  { label: 'Avg Response Time', value: '1h 18m', detail: '12 min faster today', tone: 'teal' },
]

const filterChips = ['All', 'Open', 'In Progress', 'High Priority', 'Assigned to Me']

const tickets = [
  {
    id: 'UD-2841',
    priority: 'Critical',
    title: 'Cannot access final exam timetable',
    student: 'Mia Thompson',
    category: 'Academic Records',
    status: 'Open',
    assigned: 'Anna Taylor',
    updated: '8 min ago',
  },
  {
    id: 'UD-2838',
    priority: 'High',
    title: 'Scholarship payment missing from account',
    student: 'Noah Singh',
    category: 'Finance',
    status: 'In Progress',
    assigned: 'Moana Reid',
    updated: '21 min ago',
  },
  {
    id: 'UD-2829',
    priority: 'Medium',
    title: 'Course enrolment clash after timetable change',
    student: 'Grace Chen',
    category: 'Enrolment',
    status: 'Assigned',
    assigned: 'Anna Taylor',
    updated: '46 min ago',
  },
  {
    id: 'UD-2817',
    priority: 'Low',
    title: 'Request for campus wellbeing appointment',
    student: 'Lucas Brown',
    category: 'Student Wellbeing',
    status: 'Open',
    assigned: 'Unassigned',
    updated: '1h ago',
  },
]

const urgentTickets = [
  { title: 'Visa document correction needed today', meta: 'Critical · International Office · 2h aging' },
  { title: 'Accessibility support plan not visible', meta: 'High · Wellbeing · overdue by 35m' },
  { title: 'Graduation eligibility appeal', meta: 'High · Academic Records · 11h aging' },
]

const activities = [
  { icon: CheckCircle2, text: 'Resolved ticket UD-2794 for Emma Wilson', time: '4 min ago' },
  { icon: Users, text: 'Assigned UD-2838 to Moana Reid', time: '18 min ago' },
  { icon: MessageSquare, text: 'New finance ticket submitted by Noah Singh', time: '21 min ago' },
  { icon: Clock3, text: 'Status changed on UD-2829 to Assigned', time: '46 min ago' },
]

const categoryBars = [
  ['Finance', 72],
  ['Enrolment', 56],
  ['IT Access', 44],
  ['Wellbeing', 35],
]

const statusStats = [
  ['Open', 42],
  ['Progress', 18],
  ['Resolved', 27],
]

function getAucklandGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-NZ', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Pacific/Auckland',
    }).format(new Date()),
  )

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

function getDisplayName(user) {
  if (!user) {
    return ''
  }

  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email || ''
}

export default function DashBoard() {
  const user = getStoredUser()
  const isStaff = user?.role === 'staff'

  return isStaff ? <StaffDashboard user={user} /> : <StudentDashboard user={user} />
}

function StaffDashboard({ user }) {
  const greeting = getAucklandGreeting()
  const displayName = getDisplayName(user) || staffName

  return (
    <Main className="staff-dashboard">
      <section className="staff-entry-row" aria-labelledby="staff-dashboard-title">
        <div className="staff-greeting">
          <p className="page-eyebrow">Staff Dashboard</p>
          <h1 id="staff-dashboard-title">{greeting}, {displayName}</h1>
          <p>18 active tickets require attention today.</p>
        </div>

        <div className="staff-alert-row" aria-label="Dashboard alerts">
          <button className="staff-alert-button notification-button" type="button" aria-label="Notifications">
            <Bell size={19} aria-hidden="true" />
            <span className="notification-dot" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="staff-kpi-strip" aria-label="Ticket summary">
        {kpis.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </section>

      <section className="staff-dashboard-grid">
        <article className="staff-panel ticket-queue-panel" aria-labelledby="ticket-queue-title">
          <div className="staff-panel-heading">
            <div>
              <h2 id="ticket-queue-title">Ticket Queue</h2>
              <p>Prioritised by urgency, aging, and current assignment.</p>
            </div>
            <span>{tickets.length} visible</span>
          </div>

          <div className="ticket-toolbar">
            <div className="filter-chip-row" aria-label="Ticket status filters">
              {filterChips.map((chip, index) => (
                <FilterChip key={chip} active={index === 0}>
                  {chip}
                </FilterChip>
              ))}
            </div>
            <div className="ticket-toolbar-actions">
              <label className="staff-search queue-search">
                <span>Search queue</span>
                <input type="search" placeholder="Search queue" />
              </label>
              <button className="staff-secondary-button" type="button">
                <Filter size={17} aria-hidden="true" />
                Filter
              </button>
            </div>
          </div>

          <div className="ticket-table" role="table" aria-label="Staff ticket queue">
            <div className="ticket-table-head" role="row">
              <span>Priority</span>
              <span>Ticket</span>
              <span>Student</span>
              <span>Category</span>
              <span>Status</span>
              <span>Assigned</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>

          <div className="mobile-ticket-list">
            {tickets.map((ticket) => (
              <MobileTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </article>

        <aside className="staff-panel urgent-panel" aria-labelledby="urgent-title">
          <div className="staff-panel-heading">
            <div>
              <h2 id="urgent-title">Priority Queue</h2>
              <p>Critical, aging, and overdue tickets.</p>
            </div>
            <AlertCircle size={20} aria-hidden="true" />
          </div>
          <div className="urgent-list">
            {urgentTickets.map((ticket) => (
              <button className="urgent-card" type="button" key={ticket.title}>
                <strong>{ticket.title}</strong>
                <span>{ticket.meta}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="analytics-grid" aria-label="Ticket analytics">
          <article className="staff-panel chart-panel">
            <div className="staff-panel-heading">
              <div>
                <h2>Tickets by Category</h2>
                <p>Current week intake.</p>
              </div>
              <BarChart3 size={20} aria-hidden="true" />
            </div>
            <div className="bar-chart" aria-hidden="true">
              {categoryBars.map(([label, value]) => (
                <div className="bar-row" key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="staff-panel chart-panel compact-mobile-analytics">
            <div className="staff-panel-heading">
              <div>
                <h2>Tickets by Status</h2>
                <p>Live operational split.</p>
              </div>
              <PieChart size={20} aria-hidden="true" />
            </div>
            <div className="status-chart">
              <div className="doughnut-placeholder" aria-hidden="true" />
              <div className="status-legend">
                {statusStats.map(([label, value]) => (
                  <span key={label}><i />{label} <strong>{value}</strong></span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <article className="staff-panel activity-panel" aria-labelledby="activity-title">
          <div className="staff-panel-heading">
            <div>
              <h2 id="activity-title">Recent Activity</h2>
              <p>Latest support desk movement.</p>
            </div>
          </div>
          <div className="activity-list">
            {activities.map((item) => (
              <ActivityItem key={`${item.time}-${item.text}`} {...item} />
            ))}
          </div>
        </article>
      </section>

      <section className="staff-empty-state" aria-label="Empty state example">
        <TicketCheck size={22} aria-hidden="true" />
        <p>No unassigned low-priority tickets are waiting right now.</p>
      </section>

      <section className="skeleton-panel" aria-label="Loading ticket placeholders">
        <span />
        <span />
        <span />
      </section>

      <MobileBottomNav />
    </Main>
  )
}

function StudentDashboard() {
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [query] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadTickets() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getTickets({ limit: 100 })

        if (isMounted) {
          setTickets(data.tickets.map(formatTicket))
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTickets()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'All' || ticket.status === statusFilter
      const matchesCategory =
        categoryFilter === 'All' || ticket.category === categoryFilter
      const matchesQuery =
        !normalizedQuery ||
        [ticket.title, ticket.category, ticket.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [categoryFilter, query, statusFilter, tickets])

  const summary = [
    {
      label: 'Open tickets',
      value: tickets.filter((ticket) => ticket.status === 'Open').length,
      detail: 'Waiting for review',
      icon: <Square size={18} aria-label="Open tickets" />,
    },
    {
      label: 'In progress',
      value: tickets.filter((ticket) => ticket.status === 'In Progress').length,
      detail: 'Staff are working',
      icon: <Ellipsis size={18} aria-label="In progress" />,
    },
    {
      label: 'Resolved',
      value: tickets.filter((ticket) => ticket.status === 'Resolved').length,
      detail: 'Previous tickets',
      icon: <CheckCheck size={18} aria-label="Resolved" />,
    },
    {
      label: 'Urgent tickets',
      value: tickets.filter((ticket) => ticket.urgency === 'High').length,
      detail: 'High urgency',
      icon: <CircleAlert size={18} aria-label="Urgent tickets" />,
    },
  ]

  return (
    <Main className="home-main">
      <section className="home-title-row">
        <div>
          <h1>My Support</h1>
          <p>Track your questions from open to resolved.</p>
        </div>
        <div className="home-title-actions">
          <Link className="button button-primary" to="/tickets/new">
            Create ticket
          </Link>
        </div>
      </section>

      <section className="metric-grid home-metric-grid" aria-label="Ticket summary">
        {summary.map((metric) => (
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

      <section className="student-support-layout">
        <article className="panel student-ticket-panel">
          <div className="panel-header">
            <div>
              <h2>My Tickets</h2>
              <p>Active tickets are shown first, followed by resolved tickets.</p>
            </div>
            <span>{filteredTickets.length} shown</span>
          </div>

          <div className="student-ticket-filters" aria-label="Ticket filters">
            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="All">All categories</option>
                {ticketCategories.map((category) => (
                  <option key={category.value} value={category.label}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="student-ticket-card-list">
            {isLoading && <p>Loading tickets...</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
            {!isLoading && !error && filteredTickets.length === 0 && (
              <p>No tickets match your filters.</p>
            )}
            {!isLoading &&
              !error &&
              filteredTickets.map((ticket) => (
                <TicketCard ticket={ticket} key={ticket.id} />
              ))}
          </div>
        </article>
      </section>
    </Main>
  )
}

function TicketCard({ ticket }) {
  return (
    <article className="student-ticket-card">
      <div>
        <div className="ticket-card-heading">
          <h3>{ticket.title}</h3>
          <span className={`ticket-status ticket-status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
            {ticket.status}
          </span>
        </div>
        <p className="ticket-meta">
          {ticket.category} · {ticket.urgency} urgency · Priority:{' '}
          {ticket.priority}
        </p>
        <p className="ticket-dates">
          Submitted {ticket.submitted} · Updated {ticket.updated}
        </p>
        <p className="ticket-preview">"{ticket.description}"</p>
      </div>
      <Link className="ticket-detail-link" to={`/tickets/${ticket.id}`}>
        View ticket
      </Link>
    </article>
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

function FilterChip({ active, children }) {
  return (
    <button className={`filter-chip${active ? ' filter-chip-active' : ''}`} type="button">
      {children}
    </button>
  )
}

function TicketRow({ ticket }) {
  return (
    <button className="ticket-row" type="button" role="row" aria-label={`View ${ticket.title}`}>
      <span><PriorityBadge priority={ticket.priority} /></span>
      <strong>{ticket.title}<small>{ticket.id}</small></strong>
      <span>{ticket.student}</span>
      <span>{ticket.category}</span>
      <span><StatusPill status={ticket.status} /></span>
      <span>{ticket.assigned}</span>
      <span>{ticket.updated}</span>
      <span className="ticket-actions" aria-label="Quick actions">
        <i>Assign</i>
        <i>Status</i>
        <MoreHorizontal size={18} aria-hidden="true" />
      </span>
    </button>
  )
}

function MobileTicketCard({ ticket }) {
  return (
    <button className="mobile-ticket-card" type="button" aria-label={`View ${ticket.title}`}>
      <div>
        <PriorityBadge priority={ticket.priority} />
        <StatusPill status={ticket.status} />
      </div>
      <strong>{ticket.title}</strong>
      <span>{ticket.category} · {ticket.assigned}</span>
      <small>Updated {ticket.updated}</small>
    </button>
  )
}

function PriorityBadge({ priority }) {
  return <em className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</em>
}

function StatusPill({ status }) {
  return <mark className="status-pill">{status}</mark>
}

function ActivityItem({ icon: Icon, text, time }) {
  return (
    <div className="activity-item">
      <span><Icon size={16} aria-hidden="true" /></span>
      <p>{text}<small>{time}</small></p>
    </div>
  )
}

function MobileBottomNav() {
  const items = [
    [Home, 'Home'],
    [TicketCheck, 'Tickets'],
    [Bell, 'Notifications'],
    [LineChart, 'Analytics'],
    [UserCircle2, 'Profile'],
  ]

//   return (
//     <nav className="mobile-bottom-nav" aria-label="Mobile dashboard navigation">
//       {items.map(([Icon, label], index) => (
//         <button className={index === 1 ? 'mobile-nav-active' : ''} type="button" key={label}>
//           <Icon size={19} aria-hidden="true" />
//           <span>{label}</span>
//         </button>
//       ))}
//     </nav>
//   )
// }
}
