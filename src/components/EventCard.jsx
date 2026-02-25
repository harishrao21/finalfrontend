import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/format";

export default function EventCard({ event, canDelete = false, onDelete }) {
  const soldOut = event.availableSeats <= 0;

  return (
    <article className="card event-card">
      <div className="event-head">
        <h3>{event.title}</h3>
        <span className={soldOut ? "pill danger" : "pill"}>
          {soldOut ? "Sold out" : `${event.availableSeats} seats left`}
        </span>
      </div>
      <p className="muted">{event.description.slice(0, 120)}...</p>
      <div className="info-grid">
        <span>{formatDate(event.date)}</span>
        <span>{event.location}</span>
        <span>{formatCurrency(event.price)}</span>
      </div>
      <div className="actions">
        <Link className="btn" to={`/events/${event._id}`}>
          View Details
        </Link>
        {canDelete && (
          <button className="btn danger" onClick={() => onDelete?.(event)}>
            Delete Event
          </button>
        )}
      </div>
    </article>
  );
}
