import { getStoredSession, logout } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiRequest(path, options = {}) {
  const headers = createHeaders(options);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(response);

  if (response.status === 401) {
    logout();
    if (window.location.pathname !== "/login") window.location.assign("/login");
  }

  if (!response.ok) {
    throw createApiError(
      resolveApiError(data, "Não foi possível concluir a requisição."),
      response.status,
    );
  }

  return data;
}

export async function apiRequestBlob(path, options = {}) {
  const headers = createHeaders(options);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    if (window.location.pathname !== "/login") window.location.assign("/login");
  }

  if (!response.ok) {
    const data = await parseJson(response);

    throw createApiError(
      resolveApiError(data, "Não foi possível carregar o arquivo."),
      response.status,
    );
  }

  return response.blob();
}

async function parseJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function resolveApiError(data, fallback) {
  if (Array.isArray(data?.message)) {
    return data.message.join(" ");
  }

  return data?.message ?? fallback;
}

function createHeaders(options) {
  const session = getStoredSession();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return headers;
}

function createApiError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}
