// Piccolo server per provare la pagina sul tuo PC:
//   node serve.js
// poi apri http://localhost:8080 nel browser. Si ferma con Ctrl+C.
// (Aprendo index.html con doppio clic NON funziona: il browser blocca la lettura di dati.json.)

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const radice = path.dirname(fileURLToPath(import.meta.url));
const porta = Number(process.env.PORT ?? 8080);

const tipi = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
};

const server = http.createServer(async (richiesta, risposta) => {
  const url = new URL(richiesta.url, "http://localhost");
  let relativo = decodeURIComponent(url.pathname);
  if (relativo.endsWith("/")) relativo += "index.html";
  const file = path.join(radice, relativo);

  // Sicurezza: non uscire mai dalla cartella del progetto
  if (!file.startsWith(radice + path.sep)) {
    risposta.writeHead(403).end("Vietato");
    return;
  }

  try {
    const contenuto = await readFile(file);
    risposta.writeHead(200, {
      "Content-Type": tipi[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    risposta.end(contenuto);
  } catch {
    risposta.writeHead(404).end("Non trovato");
  }
});

server.listen(porta, "127.0.0.1", () => {
  console.log(`Pagina pronta su http://localhost:${porta}  (Ctrl+C per fermare)`);
});
