// Service worker: offline básico (spec sección 6). Red primero y, si falla,
// lo último visto en caché: calendario del mes, ficha de mi rotación, avisos
// cargados y material ya abierto.
const CACHE = "beca-udp-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((c) => c.put(request, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const enCache = await caches.match(request);
        return enCache || caches.match("/");
      }),
  );
});
