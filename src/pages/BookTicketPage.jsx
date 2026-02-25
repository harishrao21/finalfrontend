import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import PageShell from "../components/PageShell";
import SeatSelector from "../components/SeatSelector";
import {
  createBookingRequest,
  createPaymentOrderRequest,
  verifyPaymentRequest
} from "../services/bookingService";
import { getEventRequest } from "../services/eventService";
import { formatCurrency } from "../utils/format";
import useAuth from "../hooks/useAuth";

export default function BookTicketPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    if (import.meta.env.VITE_MOCK_RAZORPAY === "true") return;
    if (document.getElementById("razorpay-checkout-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const total = useMemo(() => (event ? seatsBooked * event.price : 0), [seatsBooked, event]);
  const isBookingClosed = useMemo(() => {
    if (!event?.date) return false;
    return new Date(event.date) <= new Date();
  }, [event]);

  const handleSubmit = async (eventObject) => {
    eventObject.preventDefault();
    setSubmitting(true);
    try {
      if (total === 0) {
        await createBookingRequest({
          eventId,
          seatsBooked,
          paymentStatus: "paid"
        });
        toast.success("Free ticket booked successfully");
        navigate("/my-bookings");
        return;
      }

      const orderResponse = await createPaymentOrderRequest({
        eventId,
        seatsBooked
      });
      const orderData = orderResponse.data.data;

      if (orderData.mockMode || import.meta.env.VITE_MOCK_RAZORPAY === "true") {
        await verifyPaymentRequest({
          eventId,
          seatsBooked,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature"
        });
        toast.success("Mock payment successful and booking confirmed");
        navigate("/my-bookings");
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error("Missing VITE_RAZORPAY_KEY_ID in frontend env");
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EventHive",
        description: `Booking for ${event?.title || "Event"}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        handler: async (response) => {
          await verifyPaymentRequest({
            eventId,
            seatsBooked,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          toast.success("Payment successful and booking confirmed");
          navigate("/my-bookings");
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
          }
        },
        theme: {
          color: "#0f766e"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
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
        <p className="muted">Payment Method: Razorpay</p>
        <p className="price-line">Total: {formatCurrency(total)}</p>
        <button className="btn" disabled={submitting || event.availableSeats < 1 || isBookingClosed}>
          {submitting ? "Processing..." : "Pay & Confirm Booking"}
        </button>
      </form>
    </PageShell>
  );
}
