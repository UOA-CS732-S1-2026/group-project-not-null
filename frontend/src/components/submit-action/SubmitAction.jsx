import { Button } from '../button'
import './SubmitAction.css'

export default function SubmitAction({ error, isSubmitting }) {
  return (
    <footer className="submit-action">
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit ticket'}
      </Button>
    </footer>
  )
}
