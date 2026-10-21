import { test } from "node:test";
import assert from "node:assert/strict";
import { costruisciStato } from "../src/eventi.js";
import { calcolaClassifica } from "../src/classifica.js";

const eventi = [
  { tipo: "giocatore", id: "a", nome: "Anna", rating: 5 },
  { tipo: "giocatore", id: "b", nome: "Bea", rating: 5 },
  { tipo: "giocatore", id: "c", nome: "Cico", rating: 5 },
  { tipo: "giocatore", id: "d", nome: "Dino", rating: 5 },
  { tipo: "partita", squadraA: ["a", "b"], squadraB: ["c", "d"], golA: 4, golB: 1, data: "2026-10-21" },
  { tipo: "rating", id: "a", rating: 8 },
  { tipo: "partita", squadraA: ["a", "c"], squadraB: ["b", "d"], golA: 2, golB: 1, data: "2026-10-28" },
];

test("ricostruire lo stato rifacendo gli eventi", () => {
  const s = costruisciStato(eventi);
  assert.equal(s.partite.length, 2);
  assert.equal(s.giocatori.a.rating, 8);
  assert.equal(s.partite[0].data, "2026-10-21");
});

test("la prima partita usa il rating di allora, non quello cambiato dopo", () => {
  const s = costruisciStato(eventi);
  assert.equal(s.partite[0].ratingA, 10); // a=5, b=5
  assert.equal(s.partite[1].ratingA, 13); // a=8 (cambiato a mano), c=5
});

test("senza eventi lo stato e vuoto", () => {
  const s = costruisciStato([]);
  assert.deepEqual(s, { giocatori: {}, partite: [] });
  assert.deepEqual(calcolaClassifica(s), []);
});

test("togliere l'ultimo evento riporta indietro tutto (come 'annulla')", () => {
  const s = costruisciStato(eventi.slice(0, -1));
  assert.equal(s.partite.length, 1);
  assert.equal(calcolaClassifica(s).find((r) => r.id === "a").partite, 1);
});

test("un evento sbagliato viene indicato con il suo numero", () => {
  const sbagliati = [...eventi, { tipo: "partita", squadraA: ["a", "x"], squadraB: ["b"], golA: 1, golB: 0 }];
  assert.throws(() => costruisciStato(sbagliati), /Evento n\. 8 non valido/);
});

test("tipo di evento sconosciuto", () => {
  assert.throws(() => costruisciStato([{ tipo: "boh" }]), /Evento n\. 1 non valido/);
});
