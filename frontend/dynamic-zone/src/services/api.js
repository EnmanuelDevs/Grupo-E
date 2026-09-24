// Una sola dirección para las peticiones del frontend.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

// Devuelve el contenido de data; conserva el código HTTP para distinguir
// una sesión vencida (401) de un fallo temporal del servidor (500).
export async function apiRequest(path, { token, body, signal, method = "GET" } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudo conectar con el servidor. Comprueba que el backend esté encendido.", { cause: error });
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.error || "No se pudo completar la solicitud.");
    error.status = response.status;
    throw error;
  }
  return payload.data;
}