// Service worker mínimo — habilita a instalação (PWA) no Android/Chrome.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // precisa existir um handler de fetch p/ o critério de instalação; deixa a rede normal.
});
