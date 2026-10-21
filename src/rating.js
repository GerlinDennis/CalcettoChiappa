// Aggiornamento del rating di un giocatore, secondo REGOLE.md (sezione 1).
//
// Regola decisa:
// - il rating si aggiorna alla 5a partita del giocatore e poi ogni 2 partite (7a, 9a, 11a...):
//   si guardano le ultime 5 e si SOMMA al rating attuale: +1 se piu vittorie, -1 se piu sconfitte
// - nelle partite in mezzo (6a, 8a, 10a...) e fino alla 4a il rating non cambia
// - il +/-1 e cumulativo (si somma al rating attuale, non al rating di base)

export const FINESTRA = 5;
export const OGNI = 2; // dopo la 5a, si aggiorna ogni 2 partite

/**
 * @param {number} ratingAttuale  rating del giocatore prima di questa partita
 * @param {("V"|"S")[]} risultati tutti i risultati del giocatore, dal piu vecchio al piu recente,
 *                                COMPRESA la partita appena giocata
 * @returns {number} nuovo rating
 */
export function nuovoRating(ratingAttuale, risultati) {
  const n = risultati.length;
  if (n < FINESTRA || (n - FINESTRA) % OGNI !== 0) return ratingAttuale;

  const ultime = risultati.slice(-FINESTRA);
  const vittorie = ultime.filter((r) => r === "V").length;
  const sconfitte = ultime.filter((r) => r === "S").length;

  if (vittorie > sconfitte) return ratingAttuale + 1;
  if (sconfitte > vittorie) return ratingAttuale - 1;
  return ratingAttuale; // con 5 partite non puo succedere, ma meglio non dare per scontato
}
