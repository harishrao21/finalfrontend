import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import { cancelBookingRequest, listMyBookingsRequest } from "../services/bookingService";
import { formatDate } from "../utils/format";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await listMyBookingsRequest({ page: 1, limit: 20 });
      setBookings(response.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (bookingId) => {
    await cancelBookingRequest(bookingId);
    toast.success("Booking cancelled");
    load();
  };

  return (
    <PageShell title="My Bookings" subtitle="Track booking and payment status">
      {loading ? (
        <p className="card">Loading bookings...</p>
      ) : bookings.length ? (
        <section className="grid cards-grid">
          {bookings.map((booking) => (
            <article key={booking._id} className="card">
              <h3>{booking.event?.title || "Removed Event"}</h3>
              <p className="muted">Booked on {formatDate(booking.createdAt)}</p>
              <div className="info-grid">
                <span>Seats: {booking.seatsBooked}</span>
                <span>
                  Booking: <StatusBadge status={booking.bookingStatus} />
                </span>
                <span>
                  Payment: <StatusBadge status={booking.paymentStatus} />
                </span>
              </div>
              {booking.bookingStatus === "confirmed" && (
                <button className="btn danger" onClick={() => handleCancel(booking._id)}>
                  Cancel Booking
                </button>
              )}
            </article>
          ))}
        </section>
      ) : (
        <p className="card muted">No bookings yet.</p>
      )}
    </PageShell>
  );
}
