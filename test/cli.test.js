import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));

// Esegue un comando vero su un file dati temporaneo (non tocca il vero dati.json)
function creaSessione(file) {
  return (...args) => {
    const r = spawnSync(process.execPath, [cli, ...args], {
      env: { ...process.env, DATI: file },
      encoding: "utf8",
    });
    return { codice: r.status, out: r.stdout, err: r.stderr };
  };
}

async function nuovaSessione() {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "calcetto-cli-")), "dati.json");
  return { file, esegui: creaSessione(file) };
}

test("giocatori, partita e classifica da riga di comando", async () => {
  const { esegui } = await nuovaSessione();
  for (const [id, nome] of [["a", "Anna"], ["b", "Bea"], ["c", "Cico"], ["d", "Dino"]]) {
    assert.equal(esegui("giocatore", id, nome, "5").codice, 0);
  }
  const partita = esegui("partita", "a,b", "c,d", "4", "1");
  assert.equal(partita.codice, 0);
  assert.match(partita.out, /3,5 punti a testa/);
  assert.match(partita.out, /-0,5 punti a testa/);

  const classifica = esegui("classifica");
  assert.match(classifica.out, /Anna/);
  assert.ok(classifica.out.indexOf("Anna") < classifica.out.indexOf("Cico"));
});

test("partita non valida: errore e il file non cambia", async () => {
  const { file, esegui } = await nuovaSessione();
  esegui("giocatore", "a", "Anna", "5");
  esegui("giocatore", "b", "Bea", "5");
  const prima = await readFile(file, "utf8");

  const pareggio = esegui("partita", "a", "b", "2", "2");
  assert.equal(pareggio.codice, 1);
  assert.match(pareggio.err, /Pareggio/);

  const sconosciuto = esegui("partita", "a", "zzz", "2", "1");
  assert.equal(sconosciuto.codice, 1);

  assert.equal(await readFile(file, "utf8"), prima);
});

test("annulla toglie l'ultima voce", async () => {
  const { esegui } = await nuovaSessione();
  esegui("giocatore", "a", "Anna", "5");
  esegui("giocatore", "b", "Bea", "5");
  esegui("partita", "a", "b", "3", "0");
  assert.equal(esegui("annulla").codice, 0);
  assert.match(esegui("classifica").out, /Ancora nessuna partita/);
});

test("annulla senza dati dice che non c'e niente", async () => {
  const { esegui } = await nuovaSessione();
  const r = esegui("annulla");
  assert.equal(r.codice, 1);
  assert.match(r.err, /niente da annullare/);
});

test("rating a mano e numeri con la virgola", async () => {
  const { esegui } = await nuovaSessione();
  assert.equal(esegui("giocatore", "a", "Anna", "5,5").codice, 0);
  assert.equal(esegui("rating", "a", "7").codice, 0);
  assert.equal(esegui("giocatore", "b", "Bea", "abc").codice, 1);
});

test("senza comando mostra l'aiuto", async () => {
  const { esegui } = await nuovaSessione();
  assert.match(esegui().out, /Comandi:/);
});
