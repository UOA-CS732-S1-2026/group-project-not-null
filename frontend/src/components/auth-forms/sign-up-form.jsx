import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components'
import { register } from '../../services/api'
import './auth-forms.css'

const FORM_MESSAGES = {
  firstNameEmpty: 'Please enter your first name.',
  lastNameEmpty: 'Please enter your last name.',
  emailEmpty: 'Please enter your email.',
  emailInvalid: 'Please enter a valid email.',
  passwordEmpty: 'Please enter your password.',
  passwordShort: 'Password must be at least 7 characters long.',
  confirmPasswordEmpty: 'Please confirm your password.',
  passwordMismatch: "Passwords don't match.",
}

function getFormErrors(values) {
  const errors = {}

  if (!values.firstName.trim()) {
    errors.firstName = FORM_MESSAGES.firstNameEmpty
  }

  if (!values.lastName.trim()) {
    errors.lastName = FORM_MESSAGES.lastNameEmpty
  }

  if (!values.email.trim()) {
    errors.email = FORM_MESSAGES.emailEmpty
  } else if (!values.email.includes('@')) {
    errors.email = FORM_MESSAGES.emailInvalid
  }

  if (!values.password) {
    errors.password = FORM_MESSAGES.passwordEmpty
  } else if (values.password.length < 7) {
    errors.password = FORM_MESSAGES.passwordShort
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = FORM_MESSAGES.confirmPasswordEmpty
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = FORM_MESSAGES.passwordMismatch
  }

  return errors
}

export function SignUpForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState({
    accountType: 'student',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  function updateField(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = getFormErrors(values)
    setErrors(nextErrors)
    setSuccessMessage('')
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsLoading(true)

    register({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.accountType,
      department: values.accountType === 'staff' ? values.department.trim() : undefined,
    })
      .then((data) => {
        if (data.pendingApproval) {
          setSuccessMessage('Your account has been submitted for approval. You can log in once an admin approves it.')
          return
        }
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/dashboard')
      })
      .catch((error) => {
        setSubmitError(error.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="auth-account-type">
        <legend>Sign up as</legend>
        <label>
          <input
            type="radio"
            name="accountType"
            value="student"
            checked={values.accountType === 'student'}
            onChange={updateField}
          />
          <span>Student</span>
        </label>
        <label>
          <input
            type="radio"
            name="accountType"
            value="staff"
            checked={values.accountType === 'staff'}
            onChange={updateField}
          />
          <span>Staff</span>
        </label>
      </fieldset>

      <div className="auth-form-grid">
        <label className="field">
          <span>First Name</span>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={updateField}
            placeholder="Enter your first name"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'sign-up-first-name-error' : undefined}
          />
          {errors.firstName ? (
            <span className="field-error" id="sign-up-first-name-error">
              {errors.firstName}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>Last Name</span>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={updateField}
            placeholder="Enter your last name"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'sign-up-last-name-error' : undefined}
          />
          {errors.lastName ? (
            <span className="field-error" id="sign-up-last-name-error">
              {errors.lastName}
            </span>
          ) : null}
        </label>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={updateField}
          placeholder="name@university.edu"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'sign-up-email-error' : undefined}
        />
        {errors.email ? (
          <span className="field-error" id="sign-up-email-error">
            {errors.email}
          </span>
        ) : null}
      </label>

      {values.accountType === 'staff' ? (
        <label className="field">
          <span>Department</span>
          <input
            type="text"
            name="department"
            value={values.department}
            onChange={updateField}
            placeholder="e.g. IT Support"
            autoComplete="organization"
          />
        </label>
      ) : null}

      <div className="auth-form-grid">
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={updateField}
            placeholder="Enter your password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'sign-up-password-error' : undefined}
          />
          {errors.password ? (
            <span className="field-error" id="sign-up-password-error">
              {errors.password}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={updateField}
            placeholder="Confirm your password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'sign-up-confirm-password-error' : undefined
            }
          />
          {errors.confirmPassword ? (
            <span className="field-error" id="sign-up-confirm-password-error">
              {errors.confirmPassword}
            </span>
          ) : null}
        </label>
      </div>

      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button className="button-primary auth-submit" type="submit" disabled={isLoading}>
        <span aria-hidden="true">{isLoading ? '○' : '+'}</span>
        {isLoading
          ? 'Creating account...'
          : `Create ${values.accountType === 'student' ? 'Student' : 'Staff'} Account`}
      </Button>

      {successMessage ? (
        <p className="form-success" role="status">
          {successMessage}
        </p>
      ) : null}
    </form>
  )
}
