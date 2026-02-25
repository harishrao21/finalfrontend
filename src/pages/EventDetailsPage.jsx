import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import { getEventRequest } from "../services/eventService";
import { formatCurrency, formatDate } from "../utils/format";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return <PageShell title="Event Details"><p className="card">Event not found.</p></PageShell>;

  return (
    <PageShell title={event.title} subtitle={event.location}>
      <article className="card detail-card">
        <p>{event.description}</p>
        <div className="info-grid">
          <span>Date: {formatDate(event.date)}</span>
          <span>Price: {formatCurrency(event.price)}</span>
          <span>Available Seats: {event.availableSeats}</span>
          <span>Total Seats: {event.totalSeats}</span>
        </div>
        <Link className="btn" to={`/events/${event._id}/book`}>
          Book Ticket
        </Link>
      </article>
    </PageShell>
  );
}
