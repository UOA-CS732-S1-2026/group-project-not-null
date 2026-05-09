import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SignInForm,
} from '../../components/'

export default function SignIn() {
  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="sign-in-title">
        <Link className="auth-brand" to="/" aria-label="Uni Desk home">
          uni desk
        </Link>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle className="auth-title" id="sign-in-title">
              Sign in
            </CardTitle>
            <CardDescription>
              Select student or staff access, then enter your email and
              password. Don&apos;t have an account? <Link to="/sign-up">Sign Up</Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignInForm />
          </CardContent>

          <CardFooter>
            <p className="auth-terms">
              By clicking sign in, you agree to our{' '}
              <a href="#terms">Terms of Service</a>
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
