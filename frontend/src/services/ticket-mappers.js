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

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
}

const priorityLabels = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
}

const categoryLabels = Object.fromEntries(
  ticketCategories.map((category) => [category.value, category.label])
)

const urgencyLabels = Object.fromEntries(
  urgencyLevels.map((urgency) => [urgency.value, urgency.label])
)

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
    createdAtValue: createdAt?.getTime() || 0,
    updatedAtValue: updatedAt?.getTime() || 0,
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

export function fallbackPriorityFromUrgency(urgencyLevel) {
  if (urgencyLevel === 'high') return 'High'
  if (urgencyLevel === 'medium') return 'Medium'
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
