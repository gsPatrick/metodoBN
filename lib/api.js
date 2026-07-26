// lib/api.js — cliente HTTP da API (Node/Express).
// Anexa o Bearer token (localStorage "bn_token"), trata o envelope
// { success, data, error } e expõe helpers por verbo.

// Fallback hardcoded p/ produção (caso a env NEXT_PUBLIC_API_URL não esteja setada no build).
const BASE = process.env.NEXT_PUBLIC_API_URL || "https://geral-metodobnapi.r954jc.easypanel.host/api/v1";

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

// Baixa um arquivo da API (ex.: PDF do plano). Precisa de fetch autenticado —
// um <a href> simples não leva o Bearer token. Devolve o Blob e o nome do
// arquivo informado pelo servidor no Content-Disposition.
export async function apiDownload(path, fallbackName = "arquivo") {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", "NETWORK", 0);
  }
  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) return apiDownload(path, fallbackName);
  }
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const err = (json && json.error) || {};
    throw new ApiError(err.message || `Erro ${res.status}.`, err.code || "ERROR", res.status);
  }

  const cd = res.headers.get("content-disposition") || "";
  const m = /filename\*?=(?:UTF-8'')?"?([^"';]+)"?/i.exec(cd);
  const filename = m ? decodeURIComponent(m[1]) : fallbackName;
  return { blob: await res.blob(), filename };
}

// Dispara o "salvar como" do navegador a partir de um Blob.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoga depois do clique para o download não ser cancelado no Safari.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

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
