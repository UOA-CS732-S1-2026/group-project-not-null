import { Route, Routes } from 'react-router-dom'
import { LandingPage, SignIn, SignUp } from '../pages'

function Main() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
    </Routes>
  )
}

export default Main
