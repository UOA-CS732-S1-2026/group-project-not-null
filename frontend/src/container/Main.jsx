import { Route, Routes } from 'react-router-dom'
import LandingPage  from '../pages/landing-page'
import  SignIn  from '../pages/sign-in'

function Main() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
    </Routes>
  )
}

export default Main
