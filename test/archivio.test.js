import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { leggiEventi, salvaEventi } from "../src/archivio.js";

async function fileTemporaneo() {
  const cartella = await mkdtemp(path.join(tmpdir(), "calcetto-"));
  return path.join(cartella, "dati.json");
}

test("file che non esiste: nessun evento", async () => {
  assert.deepEqual(await leggiEventi(await fileTemporaneo()), []);
});

test("salva e rilegge gli stessi eventi", async () => {
  const file = await fileTemporaneo();
  const eventi = [
    { tipo: "giocatore", id: "a", nome: "Anna", rating: 5.5 },
    { tipo: "partita", squadraA: ["a"], squadraB: ["b"], golA: 2, golB: 1, data: "2026-10-21" },
  ];
  await salvaEventi(eventi, file);
  assert.deepEqual(await leggiEventi(file), eventi);
});

test("il file e JSON valido con un evento per riga", async () => {
  const file = await fileTemporaneo();
  await salvaEventi([{ tipo: "rating", id: "a", rating: 6 }, { tipo: "rating", id: "b", rating: 7 }], file);
  const testo = await readFile(file, "utf8");
  JSON.parse(testo); // non deve dare errore
  assert.equal(testo.split("\n").filter((r) => r.includes('"tipo"')).length, 2);
});

test("elenco vuoto", async () => {
  const file = await fileTemporaneo();
  await salvaEventi([], file);
  assert.deepEqual(await leggiEventi(file), []);
});
