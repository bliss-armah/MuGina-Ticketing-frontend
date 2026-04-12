import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mugina_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("mugina_token");
      localStorage.removeItem("mugina_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Events
export const eventsApi = {
  list: () => api.get("/events"),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: FormData) =>
    api.post("/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/events/${id}`),
  addTicketType: (eventId: string, data: any) =>
    api.post(`/events/${eventId}/ticket-types`, data),
  getTicketTypes: (eventId: string) =>
    api.get(`/events/${eventId}/ticket-types`),
  dashboard: () => api.get("/events/organizer/dashboard"),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post("/orders", data),
  list: () => api.get("/orders"),
  getById: (id: string) => api.get(`/orders/${id}`),
};

// Tickets
export const ticketsApi = {
  myTickets: () => api.get("/tickets/my-tickets"),
  getById: (id: string) => api.get(`/tickets/${id}`),
};

// Scanner
export const scannerApi = {
  validate: (data: { qrPayload: string; eventId: string }) =>
    api.post("/scanner/validate", data),
  getEventTickets: (eventId: string) =>
    api.get(`/scanner/event/${eventId}/tickets`),
};

// Payments
export const paymentsApi = {
  verify: (reference: string) => api.get(`/payments/verify/${reference}`),
};
