// Aggiornamento del rating di un giocatore, secondo REGOLE.md (sezione 1).
//
// Regola decisa:
// - dopo OGNI partita, se il giocatore ne ha giocate almeno 5,
//   si guardano le ultime 5 e si SOMMA al rating attuale: +1 se piu vittorie, -1 se piu sconfitte
// - fino alla 5a partita il rating non cambia
// - il +/-1 e cumulativo (si somma al rating attuale, non al rating di base)

export const FINESTRA = 5;

/**
 * @param {number} ratingAttuale  rating del giocatore prima di questa partita
 * @param {("V"|"S")[]} risultati tutti i risultati del giocatore, dal piu vecchio al piu recente,
 *                                COMPRESA la partita appena giocata
 * @returns {number} nuovo rating
 */
export function nuovoRating(ratingAttuale, risultati) {
  if (risultati.length < FINESTRA) return ratingAttuale;

  const ultime = risultati.slice(-FINESTRA);
  const vittorie = ultime.filter((r) => r === "V").length;
  const sconfitte = ultime.filter((r) => r === "S").length;

  if (vittorie > sconfitte) return ratingAttuale + 1;
  if (sconfitte > vittorie) return ratingAttuale - 1;
  return ratingAttuale; // con 5 partite non puo succedere, ma meglio non dare per scontato
}
