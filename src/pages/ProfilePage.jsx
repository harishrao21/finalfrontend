import PageShell from "../components/PageShell";
import useAuth from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <PageShell title="Profile" subtitle="Your account details">
      <article className="card profile-card">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </article>
    </PageShell>
  );
}
