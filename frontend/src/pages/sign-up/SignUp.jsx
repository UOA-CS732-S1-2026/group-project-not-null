import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SignUpForm
} from '../../components/'

export default function SignUp() {
  return (
    <main className="auth-page">
      <section className="auth-shell sign-up-shell" aria-labelledby="sign-up-title">
        <Link className="auth-brand" to="/" aria-label="Uni Desk home">
          uni desk
        </Link>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle className="auth-title" id="sign-up-title">
              Create an account
            </CardTitle>
            <CardDescription>
              Choose student or staff access, then enter your details. Already
              have an account? <Link to="/sign-in">Sign In</Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignUpForm />
          </CardContent>

          <CardFooter>
            <p className="auth-terms">
              By creating an account, you agree to our{' '}
              <a href="#terms">Terms of Service</a>
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
