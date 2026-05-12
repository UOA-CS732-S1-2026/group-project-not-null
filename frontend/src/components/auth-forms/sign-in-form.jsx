import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components'
import { login } from '../../services/api'
import './auth-forms.css'

export function SignInForm() {
  const navigate = useNavigate()

  const [accountType, setAccountType] =
    useState('student')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(
      event.currentTarget
    )

    const email =
      formData.get('email').toLowerCase()

    const password =
      formData.get('password')

    setError('')
    setIsSubmitting(true)

    // Staff validation
    if (
      accountType === 'staff' &&
      !email.endsWith(
        '@staff.unidesk.com'
      )
    ) {
      setError(
        'Staff accounts must use @staff.unidesk.com email addresses.'
      )

      setIsSubmitting(false)
      return
    }

    // Student validation
    if (
      accountType === 'student' &&
      (
        !email.endsWith('@unidesk.com') ||
        email.endsWith(
          '@staff.unidesk.com'
        )
      )
    ) {
      setError(
        'Student accounts must use @unidesk.com email addresses.'
      )

      setIsSubmitting(false)
      return
    }

    try {
      const data = await login({
        email,
        password
      })

      if (
        data.user?.role !== accountType
      ) {
        throw new Error(
          `This account is registered as ${data.user.role}, not ${accountType}.`
        )
      }

      localStorage.setItem(
        'accessToken',
        data.accessToken
      )

      localStorage.setItem(
        'refreshToken',
        data.refreshToken
      )

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )

      navigate('/')

    } catch (err) {
      setError(err.message)

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <fieldset className="auth-account-type">
        <legend>Sign in as</legend>

        <label>
          <input
            type="radio"
            name="accountType"
            value="student"
            checked={
              accountType === 'student'
            }
            onChange={(event) =>
              setAccountType(
                event.target.value
              )
            }
          />
          <span>Student</span>
        </label>

        <label>
          <input
            type="radio"
            name="accountType"
            value="staff"
            checked={
              accountType === 'staff'
            }
            onChange={(event) =>
              setAccountType(
                event.target.value
              )
            }
          />
          <span>Staff</span>
        </label>
      </fieldset>

      <label className="field">
        <span>Email</span>

        <input
          type="email"
          name="email"
          placeholder={
            accountType === 'staff'
              ? 'name@staff.unidesk.com'
              : 'name@unidesk.com'
          }
          autoComplete="email"
          required
        />
      </label>

      <label className="field">
        <span>Password</span>

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </label>

      <div className="auth-form-row">
        <label className="checkbox-field">
          <input
            type="checkbox"
            name="remember"
          />
          <span>Remember me</span>
        </label>

        <a href="#forgot-password">
          Forgot password?
        </a>
      </div>

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button
        className="button-primary auth-submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Signing in...'
          : `Sign in as ${
              accountType === 'student'
                ? 'Student'
                : 'Staff'
            }`}
      </Button>
    </form>
  )
}