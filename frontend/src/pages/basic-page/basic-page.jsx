import { Link } from 'react-router-dom'

export default function BasicPage() {
  return (
    <div className="home-page">
      <section>
        <Link className="app-title" to="/">
          Uni Desk
        </Link>
      </section>

      <section>
        <h1 className="page-title">Welcome back, student!</h1>
      </section>
    </div>
  )
}