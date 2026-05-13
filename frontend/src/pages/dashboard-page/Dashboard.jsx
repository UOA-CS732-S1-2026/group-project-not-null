import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCheck, CircleAlert, Ellipsis, Square } from 'lucide-react'

import {
  Main,
  StaffActivityFeed,
  StaffAnalyticsSection,
  StaffEntryHeader,
  StaffKpiSummary,
  StaffNotificationState,
  StaffPriorityQueue,
  StaffTicketQueue,
  StudentMetricGrid,
  StudentTicketList,
  StudentWelcomeBanner,
} from '../../components'
import {
  getTickets,
  getStaffActivity,
  getStaffDashboardAnalytics,
  getStaffDashboardSummary,
  getStaffNotifications,
  getStaffTickets,
  getStaffUrgentTickets,
} from '../../services/api.js'
import { formatTicket, ticketCategories } from '../../services/ticket-mappers.js'
import './Dashboard.css'

const summaryCards = [
  { key: 'openTickets', label: 'Open Tickets', detail: 'Waiting for review', tone: 'critical' },
  { key: 'inProgressTickets', label: 'In Progress', detail: 'Currently being handled', tone: 'medium' },
  { key: 'resolvedToday', label: 'Resolved Today', detail: 'Closed since midnight', tone: 'low' },
  { key: 'highPriorityTickets', label: 'High Priority', detail: 'Needs same-day response', tone: 'high' },
  { key: 'assignedToMe', label: 'Assigned to Me', detail: 'Active personal queue', tone: 'steel' },
  { key: 'averageResponseTime', label: 'Avg Response Time', detail: 'Resolved ticket average', tone: 'teal' },
]

const filterChips = [
  { label: 'All', params: {} },
  { label: 'Open', params: { status: 'open' } },
  { label: 'In Progress', params: { status: 'in_progress' } },
  { label: 'High Priority', params: { priority: 'high' } },
  { label: 'Assigned to Me', params: { assignedTo: 'me' } },
]

const categoryLabels = {
  IT: 'IT',
  enrolment: 'Enrolment',
  academic: 'Academic',
  'accommodation/finance': 'Accommodation/Finance',
}

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const STUDENT_TICKETS_PER_PAGE = 5
const studentStatusSortOrder = {
  Open: 0,
  'In Progress': 1,
  Resolved: 2,
}

export default function DashBoard() {
  const user = getStoredUser()

  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return user?.role === 'staff' ? <StaffDashboard user={user} /> : <StudentDashboard />
}

function StaffDashboard({ user }) {
  const greeting = getAucklandGreeting()
  const staffName = getDisplayName(user) || 'Staff'
  const [activeFilter, setActiveFilter] = useState(0)
  const [ticketSearch, setTicketSearch] = useState('')

  const [summaryState, setSummaryState] = useAsyncSection(null)
  const [ticketsState, setTicketsState] = useAsyncSection([])
  const [urgentState, setUrgentState] = useAsyncSection([])
  const [analyticsState, setAnalyticsState] = useAsyncSection({ ticketsByCategory: [], ticketsByStatus: [] })
  const [activityState, setActivityState] = useAsyncSection([])
  const [notificationState, setNotificationState] = useAsyncSection({ notifications: [], unreadCount: 0 })

  useEffect(() => {
    loadSummary()
    loadUrgentTickets()
    loadAnalytics()
    loadActivity()
    loadNotifications()
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTickets()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [activeFilter, ticketSearch])

  async function loadSummary() {
    await loadSection(setSummaryState, async () => {
      const data = await getStaffDashboardSummary()
      return data.summary
    })
  }

  async function loadTickets() {
    await loadSection(setTicketsState, async () => {
      const data = await getStaffTickets({
        ...filterChips[activeFilter].params,
        search: ticketSearch.trim(),
        page: 1,
        limit: 20,
      })
      return data.tickets || []
    })
  }

  async function loadUrgentTickets() {
    await loadSection(setUrgentState, async () => {
      const data = await getStaffUrgentTickets()
      return data.tickets || []
    })
  }

  async function loadAnalytics() {
    await loadSection(setAnalyticsState, async () => getStaffDashboardAnalytics())
  }

  async function loadActivity() {
    await loadSection(setActivityState, async () => {
      const data = await getStaffActivity()
      return data.activity || []
    })
  }

  async function loadNotifications() {
    await loadSection(setNotificationState, async () => getStaffNotifications())
  }

  const tickets = useMemo(() => ticketsState.data.map(formatStaffTicket), [ticketsState.data])
  const urgentTickets = useMemo(() => urgentState.data.map(formatUrgentTicket), [urgentState.data])
  const categoryBars = useMemo(
    () => toChartPercentages(analyticsState.data.ticketsByCategory),
    [analyticsState.data.ticketsByCategory],
  )
  const statusStats = analyticsState.data.ticketsByStatus || []
  const activeTicketCount = (summaryState.data?.openTickets || 0) + (summaryState.data?.inProgressTickets || 0)
  const operationalSummary = summaryState.isLoading
    ? 'Loading active ticket summary.'
    : `${activeTicketCount} active tickets require attention today.`

  return (
    <Main className="staff-dashboard">
      <StaffEntryHeader
        greeting={greeting}
        staffName={staffName}
        summary={operationalSummary}
        unreadCount={notificationState.data.unreadCount}
      />
      <StaffKpiSummary
        cards={summaryCards}
        summary={summaryState.data}
        isLoading={summaryState.isLoading}
        error={summaryState.error}
        onRetry={loadSummary}
      />
      <section className="staff-dashboard-grid">
        <StaffTicketQueue
          tickets={tickets}
          filters={filterChips}
          activeFilter={activeFilter}
          search={ticketSearch}
          isLoading={ticketsState.isLoading}
          error={ticketsState.error}
          onFilterChange={setActiveFilter}
          onSearchChange={setTicketSearch}
          onRetry={loadTickets}
        />
        <StaffPriorityQueue
          tickets={urgentTickets}
          isLoading={urgentState.isLoading}
          error={urgentState.error}
          onRetry={loadUrgentTickets}
        />
        <StaffAnalyticsSection
          categoryBars={categoryBars}
          statusStats={statusStats}
          isLoading={analyticsState.isLoading}
          error={analyticsState.error}
          onRetry={loadAnalytics}
        />
        <StaffActivityFeed
          activity={activityState.data}
          isLoading={activityState.isLoading}
          error={activityState.error}
          onRetry={loadActivity}
        />
      </section>
      <StaffNotificationState notificationState={notificationState} />
    </Main>
  )
}

function StudentDashboard() {
  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
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

    return tickets
      .filter((ticket) => {
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter
        const matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter
        const matchesQuery =
          !normalizedQuery ||
          [ticket.title, ticket.category, ticket.description].join(' ').toLowerCase().includes(normalizedQuery)

        return matchesStatus && matchesCategory && matchesQuery
      })
      .sort((left, right) => {
        const statusDifference =
          (studentStatusSortOrder[left.status] ?? Number.MAX_SAFE_INTEGER) -
          (studentStatusSortOrder[right.status] ?? Number.MAX_SAFE_INTEGER)

        if (statusDifference !== 0) {
          return statusDifference
        }

        return (right.createdAtValue || 0) - (left.createdAtValue || 0)
      })
  }, [categoryFilter, query, statusFilter, tickets])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, query, tickets.length])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / STUDENT_TICKETS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = filteredTickets.length === 0 ? 0 : (safeCurrentPage - 1) * STUDENT_TICKETS_PER_PAGE
  const paginatedTickets = filteredTickets.slice(pageStartIndex, pageStartIndex + STUDENT_TICKETS_PER_PAGE)

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
      <StudentWelcomeBanner />
      <StudentMetricGrid metrics={summary} />
      <StudentTicketList
        tickets={paginatedTickets}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        categories={ticketCategories}
        totalTickets={filteredTickets.length}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        error={error}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onPageChange={setCurrentPage}
      />
    </Main>
  )
}

function useAsyncSection(initialData) {
  return useState({
    data: initialData,
    error: '',
    isLoading: true,
  })
}

async function loadSection(setState, loader) {
  setState((current) => ({ ...current, error: '', isLoading: true }))

  try {
    const data = await loader()
    setState({ data, error: '', isLoading: false })
  } catch (error) {
    setState((current) => ({
      ...current,
      error: error.message || 'Unable to load dashboard data.',
      isLoading: false,
    }))
  }
}

function getAucklandGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-NZ', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Pacific/Auckland',
    }).format(new Date()),
  )

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
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
  if (!user) return ''
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email || ''
}

function formatStaffTicket(ticket) {
  return {
    id: ticket._id,
    ticketNumber: ticket.ticketNumber || ticket._id,
    priority: getPriorityLabel(ticket.priority),
    title: ticket.title,
    student: getPersonName(ticket.studentId, 'Unknown student'),
    category: categoryLabels[ticket.category] || ticket.category,
    status: statusLabels[ticket.status] || ticket.status,
    assigned: getPersonName(ticket.assignedToStaffId, 'Unassigned'),
    updated: getTimeAgo(ticket.updatedAt),
  }
}

function formatUrgentTicket(ticket) {
  const formatted = formatStaffTicket(ticket)
  return {
    id: formatted.id,
    title: formatted.title,
    meta: `${formatted.priority} · ${formatted.category} · updated ${formatted.updated}`,
  }
}

function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical'
  if (priority === 2) return 'High'
  if (priority === 3) return 'Low'
  return 'Medium'
}

function getPersonName(user, fallback) {
  if (!user) return fallback
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback
}

function getTimeAgo(value) {
  if (!value) return 'Unknown'

  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))

  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}

function toChartPercentages(items = []) {
  const max = Math.max(...items.map((item) => item.value), 0)

  if (max === 0) return []

  return items.map((item) => ({
    ...item,
    percent: Math.max(8, Math.round((item.value / max) * 100)),
  }))
}
