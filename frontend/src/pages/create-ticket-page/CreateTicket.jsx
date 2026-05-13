import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  AITriageCard,
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

const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('We could not read that image. Please try again.'))
    reader.readAsDataURL(file)
  })
}

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
  const [attachmentError, setAttachmentError] = useState('')
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const attachmentInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (selectedAttachment?.previewUrl) {
        URL.revokeObjectURL(selectedAttachment.previewUrl)
      }
    }
  }, [selectedAttachment])

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function clearSelectedAttachment() {
    setSelectedAttachment((currentAttachment) => {
      if (currentAttachment?.previewUrl) {
        URL.revokeObjectURL(currentAttachment.previewUrl)
      }

      return null
    })

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = ''
    }
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      clearSelectedAttachment()
      setAttachmentError('')
      return
    }

    if (!file.type.startsWith('image/')) {
      clearSelectedAttachment()
      setAttachmentError('Only image files can be attached to a ticket.')
      return
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      clearSelectedAttachment()
      setAttachmentError('Images must be 25 MB or smaller.')
      return
    }

    const previewUrl = URL.createObjectURL(file)

    setSelectedAttachment((currentAttachment) => {
      if (currentAttachment?.previewUrl) {
        URL.revokeObjectURL(currentAttachment.previewUrl)
      }

      return {
        file,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        previewUrl,
      }
    })
    setAttachmentError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const attachment = selectedAttachment
        ? {
            fileName: selectedAttachment.fileName,
            mimeType: selectedAttachment.mimeType,
            sizeBytes: selectedAttachment.sizeBytes,
            dataUrl: await readFileAsDataUrl(selectedAttachment.file),
          }
        : null

      const data = await createTicket({
        title: form.title,
        description: form.description,
        category: form.category,
        urgencyLevel: form.urgencyLevel,
        priority: aiPriority,
        attachment,
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
                label=""
                value={form.description}
                onChange={updateField}
                placeholder="What happened? When did it happen? Have you tried anything already?"
                required
              />
            </fieldset>

            <fieldset className="form-section">
              <legend>Attachment</legend>
              <label className="attachment-field">
                <span>Add an image (optional)</span>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml,image/heic,image/heif"
                  onChange={handleAttachmentChange}
                />
                <small>Supported image files only, up to 25 MB.</small>
              </label>

              {attachmentError ? (
                <p className="form-error attachment-error" role="alert">
                  {attachmentError}
                </p>
              ) : null}

              {selectedAttachment ? (
                <section className="attachment-preview-card" aria-label="Selected attachment preview">
                  <div className="attachment-preview-meta">
                    <div>
                      <strong>{selectedAttachment.fileName}</strong>
                      <span>{formatFileSize(selectedAttachment.sizeBytes)}</span>
                    </div>
                    <button className="button button-ghost" type="button" onClick={clearSelectedAttachment}>
                      Remove image
                    </button>
                  </div>

                  <img
                    className="attachment-preview-image"
                    src={selectedAttachment.previewUrl}
                    alt={`Preview of ${selectedAttachment.fileName}`}
                  />
                </section>
              ) : null}
            </fieldset>

            <AITriageCard formData={form} onPriorityChange={setAiPriority} />

            <SubmitAction error={error} isSubmitting={isSubmitting} />
          </form>
        )}
      </Main>
  )
}

function formatFileSize(sizeBytes) {
  if (!sizeBytes) {
    return '0 KB'
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}
