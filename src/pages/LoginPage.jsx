import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <label className="field">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        <button className="btn" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
