import { Route, Routes } from 'react-router-dom'
import { LandingPage, SignIn, SignUp, Dashboard, CreateTicket, ViewTicket, AdminPage } from '../pages'
import { AuthenticatedLayout, AdminLayout } from '../components'

function Main() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:ticketId" element={<ViewTicket />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default Main
