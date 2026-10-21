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
  // ultime 5: V V V V S -> piu vittorie -> +1 (la prima S non conta piu)
  assert.equal(nuovoRating(5, ["S", "V", "V", "V", "V", "S"]), 6);
  // ultime 5: S S S S V -> piu sconfitte -> -1
  assert.equal(nuovoRating(5, ["V", "V", "V", "S", "S", "S", "S", "V"]), 4);
});

test("il rating attuale non e per forza intero positivo: si somma a quello che c'e", () => {
  assert.equal(nuovoRating(7.5, ["V", "V", "V", "V", "V"]), 8.5);
});
