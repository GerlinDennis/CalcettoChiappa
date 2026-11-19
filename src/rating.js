// Aggiornamento del rating di un giocatore, secondo REGOLE.md (sezione 1).
//
// Regola decisa:
// - alla 5a partita del giocatore si guardano le ultime 5:
//     5V-0S: +2   4V-1S: +1   3V-2S o 2V-3S: invariato   1V-4S: -1   0V-5S: -2
// - poi si va avanti di 3 in 3 (8a, 11a, 14a...): si guardano le ultime 3:
//     3V-0S: +2   2V-1S: +1   1V-2S: -1   0V-3S: -2
// - in tutte le altre partite il rating non cambia
// - la variazione e cumulativa (si somma al rating attuale, non al rating di base)

export const PRIMA_FINESTRA = 5;
export const FINESTRA = 3; // dopo la 5a, si aggiorna ogni 3 partite guardando le ultime 3

// Variazione in base al numero di vittorie nella finestra (indice = vittorie).
const VARIAZIONE_5 = [-2, -1, 0, 0, +1, +2];
const VARIAZIONE_3 = [-2, -1, +1, +2];

/**
 * @param {number} ratingAttuale  rating del giocatore prima di questa partita
 * @param {("V"|"S")[]} risultati tutti i risultati del giocatore, dal piu vecchio al piu recente,
 *                                COMPRESA la partita appena giocata
 * @returns {number} nuovo rating
 */
export function nuovoRating(ratingAttuale, risultati) {
  const n = risultati.length;
  const vittorie = (quante) => risultati.slice(-quante).filter((r) => r === "V").length;

  if (n === PRIMA_FINESTRA) return ratingAttuale + VARIAZIONE_5[vittorie(PRIMA_FINESTRA)];
  if (n > PRIMA_FINESTRA && (n - PRIMA_FINESTRA) % FINESTRA === 0) {
    return ratingAttuale + VARIAZIONE_3[vittorie(FINESTRA)];
  }
  return ratingAttuale;
}
