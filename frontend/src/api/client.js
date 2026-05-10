const BASE_URL = "http://localhost:8080";

async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };

  const token = sessionStorage.getItem("rh_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(BASE_URL + path, opts);
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }

  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (res.status === 401 || res.status === 403) {
    window.dispatchEvent(new Event("rh:unauthorized"));
    throw new Error(json?.message || "Session expirée. Veuillez vous reconnecter.");
  }

  if (!res.ok) {
    throw new Error(json?.message || `Erreur serveur (${res.status}).`);
  }

  if (!json?.success) {
    throw new Error(json?.message || "Une erreur est survenue.");
  }

  return json.data;
}

export const get  = (path)        => api("GET",    path);
export const post = (path, body)  => api("POST",   path, body);
export const put  = (path, body)  => api("PUT",    path, body);
export const del  = (path)        => api("DELETE", path);

export default api;