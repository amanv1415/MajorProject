const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const request = async (path, options = {}) => {
  const { token, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
};

export const authApi = {
  login: (credentials) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  }),
  register: (details) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  }),
};

export const notesApi = {
  getAll: (token) => request("/notes", { token }),
  create: (token, note) => request("/notes", {
    method: "POST",
    token,
    body: JSON.stringify(note),
  }),
  update: (token, noteId, note) => request(`/notes/${noteId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(note),
  }),
  remove: (token, noteId) => request(`/notes/${noteId}`, {
    method: "DELETE",
    token,
  }),
};

const createResourceApi = (resource) => ({
  getAll: (token) => request(`/${resource}`, { token }),
  create: (token, item) => request(`/${resource}`, {
    method: "POST",
    token,
    body: JSON.stringify(item),
  }),
  update: (token, itemId, item) => request(`/${resource}/${itemId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(item),
  }),
  remove: (token, itemId) => request(`/${resource}/${itemId}`, {
    method: "DELETE",
    token,
  }),
});

export const documentsApi = createResourceApi("documents");
export const bookmarksApi = createResourceApi("bookmarks");
