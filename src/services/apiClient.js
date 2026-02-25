import axios from "axios";
import toast from "react-hot-toast";

// Central API client so all requests share same base URL, timeout, and cookie behavior.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend error shape: { success: false, message: "..." }
    const message = error?.response?.data?.message || "Request failed";

    // For 401 we usually handle redirect/logout logic in auth flow, so no duplicate toast here.
    if (error?.response?.status !== 401) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
