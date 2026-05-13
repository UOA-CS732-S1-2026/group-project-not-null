import { useEffect } from 'react'
import { Button } from '../button'
import './AttachmentPreviewModal.css'

export default function AttachmentPreviewModal({
  isOpen,
  fileName,
  fileSizeLabel,
  imageUrl,
  isLoading,
  error,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop attachment-preview-backdrop" onClick={(event) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    }}>
      <section
        aria-labelledby="attachment-preview-title"
        aria-modal="true"
        className="attachment-preview-dialog"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="attachment-preview-header">
          <div>
            <p className="page-eyebrow">Attachment Preview</p>
            <h2 id="attachment-preview-title">{fileName || 'Image attachment'}</h2>
            {fileSizeLabel ? <p>{fileSizeLabel}</p> : null}
          </div>

          <button
            aria-label="Close attachment preview"
            className="attachment-preview-close"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="attachment-preview-stage">
          {isLoading ? <p>Loading image preview...</p> : null}
          {!isLoading && error ? <p className="form-error" role="alert">{error}</p> : null}
          {!isLoading && !error && imageUrl ? (
            <img alt={fileName || 'Ticket attachment preview'} src={imageUrl} />
          ) : null}
        </div>

        <footer className="attachment-preview-actions">
          <Button className="button-primary" type="button" onClick={onClose}>
            Close
          </Button>
        </footer>
      </section>
    </div>
  )
}
