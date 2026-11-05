import { test } from "node:test";
import assert from "node:assert/strict";
import { nuovoRating } from "../src/rating.js";

test("con meno di 5 partite il rating non cambia", () => {
  assert.equal(nuovoRating(5, ["V", "V", "V", "V"]), 5);
  assert.equal(nuovoRating(5, []), 5);
});

test("5 partite con piu vittorie: +1", () => {
  assert.equal(nuovoRating(5, ["V", "V", "V", "S", "S"]), 6);
});

test("5 partite con piu sconfitte: -1", () => {
  assert.equal(nuovoRating(5, ["V", "V", "S", "S", "S"]), 4);
});

test("conta solo le ultime 5 partite (finestra mobile)", () => {
  // 7a partita, ultime 5: S V V V S -> +1 (in totale le sconfitte sarebbero di piu)
  assert.equal(nuovoRating(5, ["S", "S", "S", "V", "V", "V", "S"]), 6);
  // 7a partita, ultime 5: V S S S V -> -1 (in totale le vittorie sarebbero di piu)
  assert.equal(nuovoRating(5, ["V", "V", "V", "S", "S", "S", "V"]), 4);
});

test("dopo la 5a si aggiorna ogni 2 partite: 7a e 9a si, 6a e 8a no", () => {
  const vittorie = (n) => Array(n).fill("V");
  assert.equal(nuovoRating(5, vittorie(6)), 5);
  assert.equal(nuovoRating(5, vittorie(7)), 6);
  assert.equal(nuovoRating(5, vittorie(8)), 5);
  assert.equal(nuovoRating(5, vittorie(9)), 6);
});

test("il rating attuale non e per forza intero positivo: si somma a quello che c'e", () => {
  assert.equal(nuovoRating(7.5, ["V", "V", "V", "V", "V"]), 8.5);
});
