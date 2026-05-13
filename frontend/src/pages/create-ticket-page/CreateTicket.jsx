import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  AITriageCard,
  Button,
  DepartmentSelector,
  DescriptionArea,
  FormInput,
  Main,
  SubmitAction,
  TicketFormHeader,
} from '../../components'
import { createTicket } from '../../services/api.js'
import {
  fallbackPriorityFromUrgency,
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
  const [aiPriority, setAiPriority] = useState(() => fallbackPriorityFromUrgency('medium'))

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
        priority: aiPriority,
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
        <TicketFormHeader />

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
              <FormInput
                label="Title"
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="E.g. Unable to access student email"
                required
              />

              <DepartmentSelector
                value={form.category}
                options={ticketCategories}
                onChange={updateField}
              />
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
              <DescriptionArea
                value={form.description}
                onChange={updateField}
                placeholder="What happened? When did it happen? Have you tried anything already?"
                required
              />
            </fieldset>

            <AITriageCard formData={form} onPriorityChange={setAiPriority} />

            <SubmitAction error={error} isSubmitting={isSubmitting} />
          </form>
        )}
      </Main>
  )
}
