import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import SeatSelector from "../components/SeatSelector";
import { createBookingRequest } from "../services/bookingService";
import { getEventRequest } from "../services/eventService";
import { formatCurrency } from "../utils/format";

export default function BookTicketPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getEventRequest(eventId);
        setEvent(response.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const total = useMemo(() => (event ? seatsBooked * event.price : 0), [seatsBooked, event]);
  const isBookingClosed = useMemo(() => {
    if (!event?.date) return false;
    return new Date(event.date) <= new Date();
  }, [event]);

  const handleSubmit = async (eventObject) => {
    eventObject.preventDefault();
    setSubmitting(true);
    try {
      await createBookingRequest({
        eventId,
        seatsBooked
      });
      toast.success("Booking confirmed");
      navigate("/my-bookings");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return <PageShell title="Book Ticket"><p className="card">Event unavailable.</p></PageShell>;

  return (
    <PageShell title="Book Ticket" subtitle={event.title}>
      <form className="card booking-box" onSubmit={handleSubmit}>
        <SeatSelector max={event.availableSeats} value={seatsBooked} onChange={setSeatsBooked} />
        {isBookingClosed && <p className="muted">Booking closed: event date/time has passed.</p>}
        <p className="muted">Payment Mode: Mock (no real payment)</p>
        <p className="price-line">Total: {formatCurrency(total)}</p>
        <button className="btn" disabled={submitting || event.availableSeats < 1 || isBookingClosed}>
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </PageShell>
  );
}
