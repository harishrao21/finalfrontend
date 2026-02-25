import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageShell from "../components/PageShell";
import { createEventRequest } from "../services/eventService";

const initialState = {
  title: "",
  description: "",
  date: "",
  location: "",
  totalSeats: 10,
  price: 0
};

export default function CreateEventPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalSeats: Number(form.totalSeats),
        price: Number(form.price)
      };
      const response = await createEventRequest(payload);
      toast.success("Event created");
      navigate(`/events/${response.data.data._id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Create Event" subtitle="Admins can publish and manage events">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <label className="field">
          Title
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
        </label>
        <label className="field">
          Description
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          Date
          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          Location
          <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} required />
        </label>
        <label className="field">
          Total Seats
          <input
            type="number"
            min="1"
            value={form.totalSeats}
            onChange={(event) => setForm((prev) => ({ ...prev, totalSeats: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
        </label>
        <button className="btn" disabled={submitting}>
          {submitting ? "Publishing..." : "Publish Event"}
        </button>
      </form>
    </PageShell>
  );
}
