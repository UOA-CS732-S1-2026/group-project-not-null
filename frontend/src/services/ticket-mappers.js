export const ticketCategories = [
  { label: 'IT', value: 'IT' },
  { label: 'Enrolment', value: 'enrolment' },
  { label: 'Academic', value: 'academic' },
  { label: 'Accommodation/Finance', value: 'accommodation/finance' },
]

export const urgencyLevels = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

export const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const priorityLabels = {
  1: 'Critical',
  2: 'High',
  3: 'Low',
}

export const categoryLabels = Object.fromEntries(
  ticketCategories.map((category) => [category.value, category.label])
)

const urgencyLabels = Object.fromEntries(
  urgencyLevels.map((urgency) => [urgency.value, urgency.label])
)

export function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical'
  if (priority === 2) return 'High'
  if (priority === 3) return 'Low'
  return 'Medium'
}

export function getPersonName(user, fallback = 'Unknown') {
  if (!user) return fallback
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || fallback
}

export function getTimeAgo(value) {
  if (!value) return 'Unknown'
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatStaffTicket(ticket) {
  return {
    id: ticket._id,
    ticketNumber: ticket.ticketNumber || ticket._id,
    priority: getPriorityLabel(ticket.priority),
    title: ticket.title,
    student: getPersonName(ticket.studentId, 'Unknown student'),
    category: categoryLabels[ticket.category] || ticket.category,
    status: statusLabels[ticket.status] || ticket.status,
    statusValue: ticket.status,
    assigned: getPersonName(ticket.assignedToStaffId, 'Unassigned'),
    isAssigned: !!ticket.assignedToStaffId,
    updated: getTimeAgo(ticket.updatedAt),
  }
}

export function formatTicket(apiTicket) {
  const createdAt = apiTicket.createdAt ? new Date(apiTicket.createdAt) : null
  const updatedAt = apiTicket.updatedAt ? new Date(apiTicket.updatedAt) : null

  return {
    id: apiTicket._id,
    ticketNumber: apiTicket.ticketNumber,
    title: apiTicket.title,
    category: categoryLabels[apiTicket.category] || apiTicket.category,
    categoryValue: apiTicket.category,
    status: statusLabels[apiTicket.status] || apiTicket.status,
    statusValue: apiTicket.status,
    urgency: urgencyLabels[apiTicket.urgencyLevel] || apiTicket.urgencyLevel,
    urgencyValue: apiTicket.urgencyLevel,
    priority: priorityLabels[apiTicket.priority] || apiTicket.priority,
    submitted: formatDate(createdAt),
    updated: formatDate(updatedAt),
    description: apiTicket.description,
    staffResponse: '',
    timeline: buildTimeline(apiTicket.status),
  }
}

export function assignPriority(category, urgencyLevel) {
  if (urgencyLevel === 'high') {
    return category === 'IT' || category === 'accommodation/finance'
      ? 'Critical'
      : 'High'
  }

  if (urgencyLevel === 'medium') {
    return 'High'
  }

  return 'Low'
}

function buildTimeline(status) {
  if (status === 'resolved') {
    return ['Open', 'In Progress', 'Resolved']
  }

  if (status === 'in_progress') {
    return ['Open', 'In Progress']
  }

  return ['Open']
}

function formatDate(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
