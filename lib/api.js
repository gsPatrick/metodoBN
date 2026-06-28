// lib/api.js — cliente HTTP da API (Node/Express).
// Anexa o Bearer token (localStorage "bn_token"), trata o envelope
// { success, data, error } e expõe helpers por verbo.

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export function getToken() {
  try {
    return localStorage.getItem("bn_token");
  } catch {
    return null;
  }
}
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("bn_user") || "null");
  } catch {
    return null;
  }
}
export function setSession(token, user) {
  try {
    if (token) localStorage.setItem("bn_token", token);
    if (user) localStorage.setItem("bn_user", JSON.stringify(user));
  } catch {
    /* ignora */
  }
}
export function clearSession() {
  try {
    localStorage.removeItem("bn_token");
    localStorage.removeItem("bn_user");
    localStorage.removeItem("bn_refresh");
    localStorage.removeItem("bn_profile_id");
  } catch {
    /* ignora */
  }
}
export function isLoggedIn() {
  return !!getToken();
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Renova o access token usando o refresh token (com rotação no backend).
// Compartilha uma única chamada entre requisições simultâneas. NUNCA desloga —
// se falhar, retorna null e a sessão continua (logout é só manual).
let refreshPromise = null;
async function doRefresh() {
  let rt = null;
  try {
    rt = localStorage.getItem("bn_refresh");
  } catch {
    /* ignora */
  }
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const json = await res.json().catch(() => null);
    const d = json && json.data;
    if (!res.ok || !d || !d.accessToken) return null;
    try {
      localStorage.setItem("bn_token", d.accessToken);
      if (d.refreshToken) localStorage.setItem("bn_refresh", d.refreshToken);
    } catch {
      /* ignora */
    }
    return d.accessToken;
  } catch {
    return null;
  }
}
function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api(path, opts = {}) {
  const { method = "GET", body, auth = true, signal, _retry = false } = opts;
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e && e.name === "AbortError") throw e;
    throw new ApiError("Não foi possível conectar ao servidor.", "NETWORK", 0);
  }

  if (res.status === 204) return null;

  // Token expirado → tenta renovar uma vez e repete a chamada (sem deslogar).
  if (res.status === 401 && auth && !_retry && !path.startsWith("/auth/")) {
    const newToken = await tryRefresh();
    if (newToken) return api(path, { ...opts, _retry: true });
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* corpo vazio/não-JSON */
  }

  if (!res.ok || (json && json.success === false)) {
    const err = (json && json.error) || {};
    // Não limpa a sessão no 401 — logout é só manual.
    throw new ApiError(err.message || `Erro ${res.status}.`, err.code || "ERROR", res.status);
  }
  return json ? json.data : null;
}

export const apiGet = (p, o) => api(p, { ...o, method: "GET" });
export const apiPost = (p, body, o) => api(p, { ...o, method: "POST", body });
export const apiPut = (p, body, o) => api(p, { ...o, method: "PUT", body });
export const apiPatch = (p, body, o) => api(p, { ...o, method: "PATCH", body });
export const apiDelete = (p, o) => api(p, { ...o, method: "DELETE" });

// Id do perfil do paciente logado (cacheado em localStorage).
export async function getProfileId() {
  try {
    const cached = localStorage.getItem("bn_profile_id");
    if (cached) return cached;
  } catch {
    /* ignora */
  }
  try {
    const p = await apiGet("/users/me/profile");
    if (p && p.id) {
      try {
        localStorage.setItem("bn_profile_id", p.id);
      } catch {
        /* ignora */
      }
      return p.id;
    }
  } catch {
    /* ignora */
  }
  return null;
}
