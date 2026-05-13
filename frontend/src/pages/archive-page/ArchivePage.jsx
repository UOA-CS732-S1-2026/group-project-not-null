import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArchiveList, Main, StaffEntryHeader } from '../../components'
import { getArchivedTickets } from '../../services/api.js'
import './ArchivePage.css'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
}

export default function ArchivePage() {
  const user = getStoredUser()
  const role = user?.role || user?.user_role
  const canViewArchive = role === 'staff' || role === 'admin'
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!canViewArchive) {
      setIsLoading(false)
      return undefined
    }

    let isMounted = true

    async function loadArchive() {
      setError('')
      setIsLoading(true)

      try {
        const data = await getArchivedTickets()
        if (isMounted) {
          setTickets(data.tickets || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load archived tickets.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadArchive()

    return () => {
      isMounted = false
    }
  }, [canViewArchive])

  const archivedTickets = useMemo(() => tickets.map(formatArchiveTicket), [tickets])

  if (!canViewArchive) {
    return (
      <Main className="archive-page">
        <section className="archive-access panel">
          <h1>Access Denied</h1>
          <p>Only staff and admins can view archived tickets.</p>
          <Link className="button button-primary" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </Main>
    )
  }

  return (
    <Main className="archive-page">
      <StaffEntryHeader
        title="Archive"
        eyebrow="Historical Records"
        summary="Minimal resolved-ticket history for staff and admin review."
        unreadCount={0}
      />
      <section className="archive-panel panel">
        <div className="archive-panel-header">
          <div>
            <h2>Resolved History</h2>
          </div>
          <span>{isLoading ? 'Loading...' : `${archivedTickets.length} records`}</span>
        </div>
        <ArchiveList tickets={archivedTickets} isLoading={isLoading} error={error} />
      </section>
    </Main>
  )
}

function formatArchiveTicket(ticket) {
  return {
    id: ticket._id,
    ticketNumber: ticket.ticketNumber || ticket._id,
    title: ticket.title || 'Untitled ticket',
    resolvedAt: formatDate(ticket.resolvedAt || ticket.updatedAt),
  }
}

function formatDate(value) {
  if (!value) return 'Unknown'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
