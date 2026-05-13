import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button, Main } from '../../components'
import { createTicket } from '../../services/api.js'
import {
  assignPriority,
  ticketCategories,
  urgencyLevels,
} from '../../services/ticket-mappers.js'
import './CreateTicket.css'

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export default function CreateTicket() {
  const user = getStoredUser()
  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  const [form, setForm] = useState({
    title: '',
    category: 'IT',
    urgencyLevel: 'medium',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const priority = useMemo(
    () => assignPriority(form.category, form.urgencyLevel),
    [form.category, form.urgencyLevel]
  )

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await createTicket({
        title: form.title,
        description: form.description,
        category: form.category,
        urgencyLevel: form.urgencyLevel,
      })

      setCreatedTicketId(data.ticket._id)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Main className="home-main">
        <section className="home-title-row">
          <div>
            <h1>Create Ticket</h1>
            <p>Tell us what happened so the right team can help.</p>
          </div>
        </section>

        {submitted ? (
          <section className="panel confirmation-panel">
            <h2>Your ticket has been submitted.</h2>
            <p>We’ll notify you when its status changes.</p>
            {createdTicketId && (
              <Link className="button button-ghost" to={`/tickets/${createdTicketId}`}>
                View ticket
              </Link>
            )}
            <Link className="button button-primary" to="/dashboard">
              Back to My Support
            </Link>
          </section>
        ) : (
          <form className="panel create-ticket-form" onSubmit={handleSubmit}>
            <fieldset className="form-section">
              <legend>Request details</legend>
              <label className="field">
                <span>Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="E.g. Unable to access student email"
                  required
                />
              </label>

              <label className="field">
                <span>Category</span>
                <select name="category" value={form.category} onChange={updateField}>
                  {ticketCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset className="form-section">
              <legend>Urgency level</legend>
              <div className="urgency-options">
                {urgencyLevels.map((urgency) => (
                  <label key={urgency.value}>
                    <input
                      type="radio"
                      name="urgencyLevel"
                      value={urgency.value}
                      checked={form.urgencyLevel === urgency.value}
                      onChange={updateField}
                    />
                    <span>{urgency.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Description</legend>
              <label className="field create-ticket-description">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="What happened? When did it happen? Have you tried anything already?"
                  rows="7"
                  required
                />
              </label>
            </fieldset>

            <p className="priority-note">
              Priority is automatically assigned based on your category and
              urgency. Current priority: <strong>{priority}</strong>.
            </p>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <Button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit ticket'}
            </Button>
          </form>
        )}
      </Main>
  )
}
