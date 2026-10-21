import { test } from "node:test";
import assert from "node:assert/strict";
import { nuovoStato, aggiungiGiocatore, impostaRating, registraPartita } from "../src/stato.js";

// Stato di partenza: quattro giocatori con rating 5
function stato4() {
  let s = nuovoStato();
  for (const id of ["a", "b", "c", "d"]) s = aggiungiGiocatore(s, id, id, 5);
  return s;
}

test("registra una partita: punti, rating salvati e risultati", () => {
  const s = registraPartita(stato4(), { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 4, golB: 1 });
  const p = s.partite[0];
  assert.equal(p.id, 1);
  assert.equal(p.ratingA, 10);
  assert.equal(p.ratingB, 10);
  assert.equal(p.puntiA, 3.5); // 3 + 0,5 (scarto 3)
  assert.equal(p.puntiB, -0.5); // perde con scarto 3
  assert.deepEqual(p.ratingSalvati, { a: 5, b: 5, c: 5, d: 5 });
  assert.deepEqual(s.giocatori.a.risultati, ["V"]);
  assert.deepEqual(s.giocatori.c.risultati, ["S"]);
});

test("lo stato di partenza non viene modificato", () => {
  const prima = stato4();
  registraPartita(prima, { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 4, golB: 1 });
  assert.equal(prima.partite.length, 0);
  assert.deepEqual(prima.giocatori.a.risultati, []);
});

test("cambiare un rating dopo non modifica i punti delle partite passate", () => {
  let s = registraPartita(stato4(), { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 4, golB: 1 });
  s = impostaRating(s, "a", 9);
  assert.equal(s.giocatori.a.rating, 9);
  assert.equal(s.partite[0].puntiA, 3.5);
  assert.equal(s.partite[0].ratingSalvati.a, 5);
});

test("il +/-1 si somma dopo ogni partita, a partire dalla quinta", () => {
  let s = stato4();
  const ratingA = [];
  const ratingC = [];
  for (let i = 0; i < 6; i++) {
    s = registraPartita(s, { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 2, golB: 1 });
    ratingA.push(s.giocatori.a.rating);
    ratingC.push(s.giocatori.c.rating);
  }
  // A vince sempre: invariato fino alla 4a, poi +1 alla 5a e +1 alla 6a
  assert.deepEqual(ratingA, [5, 5, 5, 5, 6, 7]);
  // C perde sempre: invariato fino alla 4a, poi -1 alla 5a e -1 alla 6a
  assert.deepEqual(ratingC, [5, 5, 5, 5, 4, 3]);
});

test("errori: pareggio, giocatore sconosciuto, giocatore in due squadre, squadra vuota", () => {
  const s = stato4();
  assert.throws(() => registraPartita(s, { squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 2, golB: 2 }));
  assert.throws(() => registraPartita(s, { squadraA: ["a", "x"], squadraB: ["c", "d"], golA: 2, golB: 1 }));
  assert.throws(() => registraPartita(s, { squadraA: ["a", "b"], squadraB: ["b", "d"], golA: 2, golB: 1 }));
  assert.throws(() => registraPartita(s, { squadraA: [], squadraB: ["c", "d"], golA: 2, golB: 1 }));
});

test("non si puo aggiungere due volte lo stesso giocatore", () => {
  assert.throws(() => aggiungiGiocatore(stato4(), "a", "altro", 5));
});
