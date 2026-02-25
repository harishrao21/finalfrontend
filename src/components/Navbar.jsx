import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/dashboard" className="brand">
          EventHive
        </Link>

        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/my-bookings">My Bookings</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user?.role === "admin" && <NavLink to="/create-event">Create Event</NavLink>}
        </nav>

        <button className="btn ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
