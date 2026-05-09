import { useState } from 'react'
import { Button } from '../../components'
import './auth-forms.css'

export function SignInForm() {
  const [accountType, setAccountType] = useState('student')

  function handleSubmit(event) {
    event.preventDefault()
  } 

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <fieldset className="auth-account-type">
        <legend>Sign in as</legend>
        <label>
          <input
            type="radio"
            name="accountType"
            value="student"
            checked={accountType === 'student'}
            onChange={(event) => setAccountType(event.target.value)}
          />
          <span>Student</span>
        </label>
        <label>
          <input
            type="radio"
            name="accountType"
            value="staff"
            checked={accountType === 'staff'}
            onChange={(event) => setAccountType(event.target.value)}
          />
          <span>Staff</span>
        </label>
      </fieldset>

      <label className="field">
        <span>Email</span>
        <input type="email" name="email" placeholder="name@university.edu" required />
      </label>

      <label className="field">
        <span>Password</span>
        <input type="password" name="password" placeholder="Enter your password" required />
      </label>

      <div className="auth-form-row">
        <label className="checkbox-field">
          <input type="checkbox" name="remember" />
          <span>Remember me</span>
        </label>

        <a href="#forgot-password">Forgot password?</a>
      </div>

      <Button className="button-primary auth-submit" type="submit">
        Sign in as {accountType === 'student' ? 'Student' : 'Staff'}
      </Button>
    </form>
  )
}
