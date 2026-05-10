import { Route, Routes } from 'react-router-dom'
import { LandingPage, SignIn, SignUp, Dashboard, CreateTicket, ViewTicket } from '../pages'
import { AuthenticatedLayout } from '../components'

function Main() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route element={<AuthenticatedLayout />}>
        {/* Protected routes go here */}
        <Route path="/home" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:ticketId" element={<ViewTicket />} />
      </Route>
    </Routes>
  )
}

export default Main
