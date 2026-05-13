import { Link } from 'react-router-dom'
import './StudentWelcomeBanner.css'

export default function StudentWelcomeBanner() {
  return (
    <section className="home-title-row">
      <div>
        <h1>My Support</h1>
        <p>Track your questions from open to resolved.</p>
      </div>
      <div className="home-title-actions">
        <Link className="button button-primary" to="/tickets/new">
          Raise Querry!
        </Link>
      </div>
    </section>
  )
}
