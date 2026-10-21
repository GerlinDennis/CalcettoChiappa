import { test } from "node:test";
import assert from "node:assert/strict";
import { puntiPartita, ratingSquadra } from "../src/punti.js";

// Esempi della tabella in REGOLE.md
const esempi = [
  // [ratingA, ratingB, golA, golB, puntiA, puntiB]
  [25, 22, 7, 1, 3.5, -1],
  [20, 26, 4, 3, 4, -1],
  [24, 24, 5, 1, 3.5, -0.5],
  [24, 24, 3, 2, 3, 0],
  [36, 24, 4, 3, 1, 0],
  [42, 24, 4, 3, 0, 0],
  [45, 24, 4, 3, 0, 0], // sarebbe -0,5: minimo 0
];

for (const [ratingA, ratingB, golA, golB, A, B] of esempi) {
  test(`esempio ${ratingA}-${ratingB}, ${golA}-${golB}`, () => {
    assert.deepEqual(puntiPartita({ ratingA, ratingB, golA, golB }), { A, B });
  });
}

// I quattro casi del perdente decisi insieme
test("perdente: rating uguali, 2-3 -> 0", () => {
  assert.equal(puntiPartita({ ratingA: 24, ratingB: 24, golA: 2, golB: 3 }).A, 0);
});
test("perdente: rating uguali, 1-7 -> -1", () => {
  assert.equal(puntiPartita({ ratingA: 24, ratingB: 24, golA: 1, golB: 7 }).A, -1);
});
test("perdente: squadra piu forte di 6, 2-3 -> -1", () => {
  assert.equal(puntiPartita({ ratingA: 30, ratingB: 24, golA: 2, golB: 3 }).A, -1);
});
test("perdente: squadra piu debole di 6, 2-3 -> 0", () => {
  assert.equal(puntiPartita({ ratingA: 24, ratingB: 30, golA: 2, golB: 3 }).A, 0);
});

// Arrotondamenti per difetto
test("scarto 5 gol conta una volta sola", () => {
  assert.deepEqual(puntiPartita({ ratingA: 24, ratingB: 24, golA: 6, golB: 1 }), { A: 3.5, B: -0.5 });
});
test("differenza rating 5 conta una volta sola", () => {
  assert.deepEqual(puntiPartita({ ratingA: 29, ratingB: 24, golA: 1, golB: 0 }), { A: 2.5, B: 0 });
});

// Vince B (partita specchiata)
test("vince B favorita di 6, 4-3", () => {
  assert.deepEqual(puntiPartita({ ratingA: 20, ratingB: 26, golA: 3, golB: 4 }), { A: 0, B: 2 });
});

// Pareggio non ammesso
test("il pareggio dà errore", () => {
  assert.throws(() => puntiPartita({ ratingA: 24, ratingB: 24, golA: 2, golB: 2 }));
});

test("rating squadra = somma dei giocatori", () => {
  assert.equal(ratingSquadra([5, 6, 4, 5, 5]), 25);
});
