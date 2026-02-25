import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="auth-layout">
      <article className="card auth-card">
        <h1>404</h1>
        <p className="muted">Page not found.</p>
        <Link className="btn" to="/dashboard">
          Go to Dashboard
        </Link>
      </article>
    </main>
  );
}
