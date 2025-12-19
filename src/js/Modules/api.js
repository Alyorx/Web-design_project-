const BASE_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(
  endpoint,
  {
    method = "GET",
    body = null,
    headers = {},
    credentials = "include"
  } = {}
) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    credentials
  };

  if (body !== null) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (url) => apiFetch(url),
  post: (url, body) => apiFetch(url, { method: "POST", body }),
  put: (url, body) => apiFetch(url, { method: "PUT", body }),
  delete: (url, body = null) => apiFetch(url, { method: "DELETE", body })
};
