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

  // handle 401 by dispatching a custom event — AuthContext listens and logs out
  if (res.status === 401) {
    window.dispatchEvent(new Event("rh:unauthorized"));
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Réponse invalide du serveur (HTTP ${res.status}).`);
  }

  if (!json.success) {
    throw new Error(json.message || "Une erreur est survenue.");
  }

  return json.data;
}

export const get  = (path)        => api("GET",    path);
export const post = (path, body)  => api("POST",   path, body);
export const put  = (path, body)  => api("PUT",    path, body);
export const del  = (path)        => api("DELETE", path);

export default api;