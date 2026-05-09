import { Route, Routes } from 'react-router-dom'
import LandingPage from '../pages/landing-page'

function Main() {
  // -- render ---------------------------------------------------------------

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default Main
