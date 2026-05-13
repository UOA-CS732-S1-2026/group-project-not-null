const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * @typedef {Object} StaffDashboardSummary
 * @property {number} openTickets
 * @property {number} inProgressTickets
 * @property {number} resolvedToday
 * @property {number} highPriorityTickets
 * @property {number} assignedToMe
 * @property {string} averageResponseTime
 */

/**
 * @typedef {Object} StaffTicket
 * @property {string} _id
 * @property {string} ticketNumber
 * @property {string} title
 * @property {string} category
 * @property {string} status
 * @property {string} urgencyLevel
 * @property {number} priority
 * @property {Object} studentId
 * @property {Object | null} assignedToStaffId
 * @property {string} updatedAt
 */

/**
 * @typedef {StaffTicket} StaffUrgentTicket
 */

/**
 * @typedef {Object} StaffAnalytics
 * @property {{ name: string, value: number }[]} ticketsByCategory
 * @property {{ name: string, value: number }[]} ticketsByStatus
 */

/**
 * @typedef {Object} StaffActivityItem
 * @property {string} id
 * @property {string} type
 * @property {string} text
 * @property {string} timestamp
 */

/**
 * @typedef {Object} StaffNotification
 * @property {string} id
 * @property {string} title
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} read
 */

/**
 * @typedef {Object} StaffUser
 * @property {string} _id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string | null} department
 */

async function request(path, options = {}) {
  const accessToken = localStorage.getItem('accessToken')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register({ email, password, firstName, lastName, role, department }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName, role, department }),
  })
}

export function getTickets(params = {}) {
  return request(`/tickets${buildQuery(params)}`)
}

export function getTicket(ticketId) {
  return request(`/tickets/${ticketId}`)
}

export function createTicket({ title, description, category, urgencyLevel }) {
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ title, description, category, urgencyLevel }),
  })
}

export function getStaffDashboardSummary() {
  return request('/staff/dashboard/summary')
}

export function getStaffTickets(params = {}) {
  return request(`/staff/tickets${buildQuery(params)}`)
}

export function getMyStaffTickets() {
  return request('/staff/my-tickets')
}

export function getStaffUrgentTickets() {
  return request('/staff/tickets/urgent')
}

export function getStaffTicket(ticketId) {
  return request(`/staff/tickets/${ticketId}`)
}

export function updateStaffTicket(ticketId, updates) {
  return request(`/staff/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function addStaffTicketNote(ticketId, { content }) {
  return request(`/staff/tickets/${ticketId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getStaffUsers() {
  return request('/staff/users')
}

export function getStaffDashboardAnalytics() {
  return request('/staff/dashboard/analytics')
}

export function getStaffActivity() {
  return request('/staff/activity')
}

export function getStaffNotifications() {
  return request('/staff/notifications')
}
