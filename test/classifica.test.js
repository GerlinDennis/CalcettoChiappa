import { test } from "node:test";
import assert from "node:assert/strict";
import { nuovoStato, aggiungiGiocatore, registraPartita } from "../src/stato.js";
import { calcolaClassifica } from "../src/classifica.js";

// Otto giocatori con rating 5, piu "z" che non gioca mai.
// m1: [a,b] battono [c,d] 4-1 -> a,b 3,5 ; c,d -0,5
// m2: [a,c] battono [b,d] 2-1 -> a,c 3   ; b,d 0
// m3: [e,f] battono [g,h] 4-1 -> e,f 3,5 ; g,h -0,5
function scenario() {
  let s = nuovoStato();
  for (const id of ["a", "b", "c", "d", "e", "f", "g", "h", "z"]) s = aggiungiGiocatore(s, id, id, 5);
  s = registraPartita(s, { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 4, golB: 1 });
  s = registraPartita(s, { squadraA: ["a", "c"], squadraB: ["b", "d"], golA: 2, golB: 1 });
  s = registraPartita(s, { squadraA: ["e", "f"], squadraB: ["g", "h"], golA: 4, golB: 1 });
  return s;
}

test("colonne: partite, punti totali, differenza reti, media", () => {
  const righe = Object.fromEntries(calcolaClassifica(scenario()).map((r) => [r.id, r]));
  assert.deepEqual(
    { partite: righe.a.partite, punti: righe.a.punti, diffReti: righe.a.diffReti, media: righe.a.media },
    { partite: 2, punti: 6.5, diffReti: 4, media: 3.25 },
  );
  assert.deepEqual(
    { partite: righe.d.partite, punti: righe.d.punti, diffReti: righe.d.diffReti, media: righe.d.media },
    { partite: 2, punti: -0.5, diffReti: -4, media: -0.25 },
  );
  assert.deepEqual(
    { partite: righe.e.partite, punti: righe.e.punti, diffReti: righe.e.diffReti, media: righe.e.media },
    { partite: 1, punti: 3.5, diffReti: 3, media: 3.5 },
  );
});

test("ordine di default: punti totali, a parita differenza reti", () => {
  const ordine = calcolaClassifica(scenario()).map((r) => r.id);
  assert.deepEqual(ordine, ["a", "e", "f", "b", "c", "g", "h", "d"]);
});

test("ordine per media: cambia la classifica", () => {
  const ordine = calcolaClassifica(scenario(), { ordinaPer: "media" }).map((r) => r.id);
  assert.deepEqual(ordine, ["e", "f", "a", "b", "c", "d", "g", "h"]);
});

test("chi non ha mai giocato non compare", () => {
  const ids = calcolaClassifica(scenario()).map((r) => r.id);
  assert.ok(!ids.includes("z"));
});

test("classifica vuota senza partite", () => {
  assert.deepEqual(calcolaClassifica(nuovoStato()), []);
});
