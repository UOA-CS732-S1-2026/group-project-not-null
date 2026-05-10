const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return request(`/tickets${query ? `?${query}` : ''}`)
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
