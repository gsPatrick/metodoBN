// lib/socket.js — conexão Socket.io com o backend (realtime do chat).
// Carrega o client do próprio servidor (/socket.io/socket.io.js), sem dependência npm.
import { getToken } from "./api";

function apiOrigin() {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    return new URL(base).origin;
  } catch {
    return base.replace(/\/api\/v\d+\/?$/, "");
  }
}

let ioPromise = null;
function loadIo() {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.io) return Promise.resolve(window.io);
  if (ioPromise) return ioPromise;
  ioPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("socketio-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.io));
      existing.addEventListener("error", () => reject(new Error("io-load")));
      return;
    }
    const s = document.createElement("script");
    s.id = "socketio-js";
    s.src = `${apiOrigin()}/socket.io/socket.io.js`;
    s.async = true;
    s.onload = () => resolve(window.io);
    s.onerror = () => reject(new Error("io-load"));
    document.head.appendChild(s);
  });
  return ioPromise;
}

let socket = null;
let socketPromise = null;
export async function getSocket() {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;
  if (socket) return socket;
  if (socketPromise) return socketPromise;
  socketPromise = loadIo()
    .then((io) =>
      io(apiOrigin(), {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1500,
      })
    )
    .then((s) => {
      socket = s;
      return s;
    })
    .catch(() => null);
  return socketPromise;
}

// Registra um handler de "message:new" e devolve a função de unsubscribe.
export function onNewMessage(handler) {
  let s = null;
  let off = false;
  getSocket().then((sock) => {
    if (off || !sock) return;
    s = sock;
    sock.on("message:new", handler);
  });
  return () => {
    off = true;
    if (s) s.off("message:new", handler);
  };
}
