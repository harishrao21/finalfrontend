import apiClient from "./apiClient";

export const createBookingRequest = (payload) => apiClient.post("/bookings", payload);
export const listMyBookingsRequest = (params) => apiClient.get("/bookings/me", { params });
export const cancelBookingRequest = (bookingId) => apiClient.patch(`/bookings/${bookingId}/cancel`);
export const listAllBookingsRequest = (params) => apiClient.get("/bookings", { params });
export const exportAdminReportRequest = (params) =>
  apiClient.get("/bookings/export", {
    params: { ...(params || {}), _t: Date.now() },
    responseType: "blob"
  });
export const createPaymentOrderRequest = (payload) => apiClient.post("/bookings/payment/order", payload);
export const verifyPaymentRequest = (payload) => apiClient.post("/bookings/payment/verify", payload);
