import { useEffect, useMemo, useState } from 'react'
import { Main, StaffTicketQueue } from '../../components'
import { getStaffTickets } from '../../services/api'
import { formatStaffTicket } from '../../services/ticket-mappers'

const filterChips = [
  { label: 'All', params: {} },
  { label: 'Open', params: { status: 'open' } },
  { label: 'In Progress', params: { status: 'in_progress' } },
  { label: 'High Priority', params: { priority: 'high' } },
]

function useAsyncSection(initialData) {
  return useState({ data: initialData, error: '', isLoading: true })
}

async function loadSection(setState, loader) {
  setState((current) => ({ ...current, error: '', isLoading: true }))
  try {
    const data = await loader()
    setState({ data, error: '', isLoading: false })
  } catch (error) {
    setState((current) => ({
      ...current,
      error: error.message || 'Unable to load tickets.',
      isLoading: false,
    }))
  }
}

export default function TicketsPage() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketsState, setTicketsState] = useAsyncSection([])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSection(setTicketsState, async () => {
        const data = await getStaffTickets({
          ...filterChips[activeFilter].params,
          assignedTo: 'me',
          search: ticketSearch.trim(),
          page: 1,
          limit: 50,
        })
        return data.tickets || []
      })
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [activeFilter, ticketSearch])

  const tickets = useMemo(() => ticketsState.data.map(formatStaffTicket), [ticketsState.data])

  function handleRetry() {
    loadSection(setTicketsState, async () => {
      const data = await getStaffTickets({
        ...filterChips[activeFilter].params,
        assignedTo: 'me',
        search: ticketSearch.trim(),
        page: 1,
        limit: 50,
      })
      return data.tickets || []
    })
  }

  return (
    <Main>
      <section className="page-header">
        <h1>All Tickets</h1>
        <p>View and manage all support tickets.</p>
      </section>
      <StaffTicketQueue
        tickets={tickets}
        filters={filterChips}
        activeFilter={activeFilter}
        search={ticketSearch}
        isLoading={ticketsState.isLoading}
        error={ticketsState.error}
        onFilterChange={setActiveFilter}
        onSearchChange={setTicketSearch}
        onRetry={handleRetry}
      />
    </Main>
  )
}
