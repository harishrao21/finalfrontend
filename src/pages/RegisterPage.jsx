import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", adminPasscode: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <label className="field">
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
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
        <label className="field">
          Role
          <select
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                role: event.target.value,
                adminPasscode: event.target.value === "admin" ? prev.adminPasscode : ""
              }))
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {form.role === "admin" && (
          <label className="field">
            Admin Passcode
            <input
              type="password"
              value={form.adminPasscode}
              onChange={(event) => setForm((prev) => ({ ...prev, adminPasscode: event.target.value }))}
              placeholder="Enter admin passcode"
              required
            />
          </label>
        )}
        <button className="btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
