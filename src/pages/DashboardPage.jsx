import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import { deleteEventRequest, listEventsRequest, listMyEventsRequest } from "../services/eventService";
import { exportAdminReportRequest, listAllBookingsRequest } from "../services/bookingService";
import useAuth from "../hooks/useAuth";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [seatSummary, setSeatSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEvents = async (searchTerm = "") => {
    setLoading(true);
    try {
      const eventRequest =
        user?.role === "admin"
          ? listMyEventsRequest({ search: searchTerm, page: 1, limit: 12 })
          : listEventsRequest({ search: searchTerm, page: 1, limit: 12 });
      const requests = [eventRequest];
      if (user?.role === "admin") {
        requests.push(listAllBookingsRequest({ page: 1, limit: 15 }));
      }

      const [eventsResponse, bookingsResponse] = await Promise.all(requests);

      const response = eventsResponse;
      setEvents(response.data.data.items);

      if (bookingsResponse) {
        setAdminBookings(bookingsResponse.data.data.items || []);
        setSeatSummary(bookingsResponse.data.data.seatSummary || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user?.role]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadEvents(search);
  };

  const triggerExcelDownload = (blob, fileName) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const downloadAdminReport = async (eventId) => {
    const response = await exportAdminReportRequest(eventId ? { eventId } : undefined);
    const defaultName = eventId ? `event_report_event_${eventId}.xlsx` : "event_report_all_events.xlsx";
    triggerExcelDownload(response.data, defaultName);
  };

  const handleDeleteEvent = async (eventItem) => {
    const ok = window.confirm(`Delete "${eventItem.title}"? This action cannot be undone.`);
    if (!ok) return;

    // Required flow: download event report before deleting the event.
    await downloadAdminReport(eventItem._id);
    await deleteEventRequest(eventItem._id);
    toast.success("Event deleted");
    loadEvents(search);
  };

  return (
    <PageShell
      title="Dashboard"
      subtitle="Browse upcoming events and book your seats"
      rightSlot={
        <div className="search-actions">
          <form onSubmit={handleSearch} className="search-box">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or location" />
            <button className="btn">Search</button>
          </form>
          {user?.role === "admin" && (
            <button className="btn ghost" onClick={() => downloadAdminReport()}>
              Download All Excel
            </button>
          )}
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : events.length ? (
        <section className="grid cards-grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              canDelete={user?.role === "admin"}
              onDelete={handleDeleteEvent}
            />
          ))}
        </section>
      ) : (
        <p className="card muted">No events available.</p>
      )}

      {user?.role === "admin" && (
        <>
          <section className="card admin-table-wrap">
            <h2>Event Seat Summary</h2>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Total Seats</th>
                    <th>Booked Seats</th>
                    <th>Seats Left</th>
                    <th>Excel</th>
                  </tr>
                </thead>
                <tbody>
                  {seatSummary.map((entry) => (
                    <tr key={entry._id}>
                      <td>{entry.title}</td>
                      <td>{entry.totalSeats}</td>
                      <td>{entry.bookedSeats}</td>
                      <td>{entry.availableSeats}</td>
                      <td>
                        <button
                          className="btn ghost"
                          onClick={() => downloadAdminReport(entry.eventId || entry._id)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card admin-table-wrap">
            <h2>Recent User Bookings</h2>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Seats Booked</th>
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.user?.name || "N/A"}</td>
                      <td>{booking.user?.email || "N/A"}</td>
                      <td>{booking.event?.title || "N/A"}</td>
                      <td>{booking.seatsBooked}</td>
                      <td>
                        <StatusBadge status={booking.bookingStatus} />
                      </td>
                      <td>
                        <StatusBadge status={booking.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}
