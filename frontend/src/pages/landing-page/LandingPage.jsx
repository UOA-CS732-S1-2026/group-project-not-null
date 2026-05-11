
import './LandingPage.css'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="landing-logo" to="/">
          Uni Desk
        </Link>
        <nav className="landing-header-nav" aria-label="Landing sections">
          <a href="#support">Support</a>
          <a href="#students">Students</a>
          <a href="#staff">Staff</a>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="hero-accent" aria-hidden="true" />

        <div className="landing-hero-grid">
          <section className="hero-content" aria-labelledby="landing-title">
            <p className="eyebrow">University Support Platform</p>
            <h1 id="landing-title">
              Manage Campus <span>Support Tickets</span> Easily
            </h1>
            <p className="hero-copy">
              A secure support system for students and staff to submit, track,
              and resolve university requests from one shared workspace.
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" to="/sign-in">
                Sign In
              </Link>
              <Link className="button button-ghost" to="/sign-up">
                Sign Up
              </Link>
            </div>
          </section>

          <section className="landing-wheel-panel" aria-label="Support overview">
            <div className="support-wheel">
              <div className="floating-card wheel-card-one">Student Requests</div>
              <div className="wheel-rotate" aria-hidden="true">
                <span className="wheel-slice wheel-slice-one" />
                <span className="wheel-slice wheel-slice-two" />
                <span className="wheel-slice wheel-slice-three" />
              </div>
              <div className="wheel-center">
                <strong>94%</strong>
                <span>Resolved</span>
              </div>
              <div className="floating-card wheel-card-two">Staff Support</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
