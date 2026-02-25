import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="container home-topbar">
        <Link to="/login" className="btn ghost">
          Login
        </Link>
      </div>

      <section className="container home-hero card">
        <h1>Welcome to EventHive</h1>
        <p className="muted">Discover events, book tickets, and manage your plans in one place.</p>
        <Link to="/login" className="btn">
          Get Started
        </Link>
      </section>
    </main>
  );
}
