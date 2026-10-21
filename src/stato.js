// Stato dell'app: giocatori e partite. Tutte le funzioni sono "pure":
// non modificano lo stato che ricevono, ne restituiscono uno nuovo.
//
// stato = {
//   giocatori: { [id]: { nome, rating, risultati: ["V"|"S", ...] } },
//   partite:   [ { id, squadraA, squadraB, golA, golB,
//                  ratingSalvati, ratingA, ratingB, puntiA, puntiB } ]
// }

import { puntiPartita, ratingSquadra } from "./punti.js";
import { nuovoRating } from "./rating.js";

export function nuovoStato() {
  return { giocatori: {}, partite: [] };
}

/** Aggiunge un giocatore con il suo rating (la media delle valutazioni). */
export function aggiungiGiocatore(stato, id, nome, rating) {
  if (stato.giocatori[id]) throw new Error(`Giocatore gia presente: ${id}`);
  return {
    ...stato,
    giocatori: { ...stato.giocatori, [id]: { nome, rating, risultati: [] } },
  };
}

/** Cambia a mano il rating di un giocatore. Le partite gia giocate NON cambiano. */
export function impostaRating(stato, id, rating) {
  const g = stato.giocatori[id];
  if (!g) throw new Error(`Giocatore sconosciuto: ${id}`);
  return {
    ...stato,
    giocatori: { ...stato.giocatori, [id]: { ...g, rating } },
  };
}

/**
 * Registra una partita: calcola i punti con i rating di QUESTO momento,
 * li salva nella partita, poi aggiorna risultati e rating dei giocatori.
 * @param {object} stato
 * @param {{squadraA: string[], squadraB: string[], golA: number, golB: number}} input
 */
export function registraPartita(stato, { squadraA, squadraB, golA, golB, data }) {
  if (squadraA.length === 0 || squadraB.length === 0) {
    throw new Error("Ogni squadra deve avere almeno un giocatore.");
  }
  const tutti = [...squadraA, ...squadraB];
  for (const id of tutti) {
    if (!stato.giocatori[id]) throw new Error(`Giocatore sconosciuto: ${id}`);
  }
  if (new Set(tutti).size !== tutti.length) {
    throw new Error("Un giocatore non puo stare in due squadre (o due volte nella stessa).");
  }

  // Rating di questo momento, salvati nella partita
  const ratingSalvati = {};
  for (const id of tutti) ratingSalvati[id] = stato.giocatori[id].rating;

  const ratingA = ratingSquadra(squadraA.map((id) => ratingSalvati[id]));
  const ratingB = ratingSquadra(squadraB.map((id) => ratingSalvati[id]));
  const punti = puntiPartita({ ratingA, ratingB, golA, golB }); // lancia errore se pareggio

  const partita = {
    id: stato.partite.length + 1,
    ...(data ? { data } : {}), // data della partita (testo "AAAA-MM-GG"), facoltativa
    squadraA: [...squadraA],
    squadraB: [...squadraB],
    golA,
    golB,
    ratingSalvati,
    ratingA,
    ratingB,
    puntiA: punti.A,
    puntiB: punti.B,
  };

  // Aggiorna risultati e rating di ogni giocatore
  const vinceA = golA > golB;
  const giocatori = { ...stato.giocatori };
  for (const id of squadraA) giocatori[id] = aggiorna(giocatori[id], vinceA ? "V" : "S");
  for (const id of squadraB) giocatori[id] = aggiorna(giocatori[id], vinceA ? "S" : "V");

  return { giocatori, partite: [...stato.partite, partita] };
}

function aggiorna(giocatore, esito) {
  const risultati = [...giocatore.risultati, esito];
  return { ...giocatore, risultati, rating: nuovoRating(giocatore.rating, risultati) };
}
