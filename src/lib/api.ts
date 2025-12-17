const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "API request failed");
  }

  return data;
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  getMe: () => apiRequest("/auth/me"),

  getTickets: () => apiRequest("/tickets"),
  
  getTicket: (id: string) => apiRequest(`/tickets/${id}`),
  
  createTicket: (ticketData: any) =>
    apiRequest("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    }),
  
  updateTicket: (id: string, updates: any) =>
    apiRequest(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getTasksByTicket: (ticketId: string) =>
    apiRequest(`/tasks/ticket/${ticketId}`),
  
  createTask: (taskData: any) =>
    apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
  
  updateTask: (id: string, updates: any) =>
    apiRequest(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  
  deleteTask: (id: string) =>
    apiRequest(`/tasks/${id}`, { method: "DELETE" }),

  getCommentsByTicket: (ticketId: string) =>
    apiRequest(`/comments/ticket/${ticketId}`),
  
  createComment: (commentData: any) =>
    apiRequest("/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  getUsers: () => apiRequest("/users"),
  
  createUser: (userData: any) =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  
  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, { method: "DELETE" }),

  getCompanies: () => apiRequest("/companies"),
  
  createCompany: (companyData: any) =>
    apiRequest("/companies", {
      method: "POST",
      body: JSON.stringify(companyData),
    }),
};
