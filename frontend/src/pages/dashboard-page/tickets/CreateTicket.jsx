import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Header } from '../../components/layout/Header.jsx'
import { Main } from '../../components/layout/Main.jsx'
import { TopNav } from '../../components/layout/TopNav.jsx'
import {
  assignPriority,
  ticketCategories,
  urgencyLevels,
} from './ticketData.js'

const topNav = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Tickets', href: '/tickets' },
  { title: 'Create Ticket', href: '/tickets/new' },
]

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '',
    category: 'IT',
    urgency: 'Medium',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const priority = useMemo(
    () => assignPriority(form.category, form.urgency),
    [form.category, form.urgency]
  )

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
      </Header>
      <Main className="home-main">
        <section className="home-title-row">
          <div>
            <p className="page-eyebrow">Student Support</p>
            <h1>Create Ticket</h1>
            <p>Tell us what happened so the right team can help.</p>
          </div>
        </section>

        {submitted ? (
          <section className="panel confirmation-panel">
            <h2>Your ticket has been submitted.</h2>
            <p>We’ll notify you when its status changes.</p>
            <Link className="button button-primary" to="/dashboard">
              Back to My Support
            </Link>
          </section>
        ) : (
          <form className="panel create-ticket-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Title</span>
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="Unable to access student email"
                required
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select name="category" value={form.category} onChange={updateField}>
                {ticketCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="urgency-options">
              <legend>Urgency level</legend>
              {urgencyLevels.map((urgency) => (
                <label key={urgency}>
                  <input
                    type="radio"
                    name="urgency"
                    value={urgency}
                    checked={form.urgency === urgency}
                    onChange={updateField}
                  />
                  <span>{urgency}</span>
                </label>
              ))}
            </fieldset>

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

            <p className="priority-note">
              Priority is automatically assigned based on your category and
              urgency. Current priority: <strong>{priority}</strong>.
            </p>

            <Button className="button-primary auth-submit" type="submit">
              Submit ticket
            </Button>
          </form>
        )}
      </Main>
    </>
  )
}
