// Calcolo dei punti di una partita, secondo REGOLE.md (sezione 2).
// Tutti i "ogni 3" sono per difetto: si usa Math.floor(x / 3).

/**
 * Somma i rating dei giocatori di una squadra.
 * @param {number[]} ratingGiocatori
 */
export function ratingSquadra(ratingGiocatori) {
  return ratingGiocatori.reduce((somma, r) => somma + r, 0);
}

/**
 * Punti assegnati alle due squadre (e quindi a ogni giocatore) dopo una partita.
 * @param {{ratingA: number, ratingB: number, golA: number, golB: number}} partita
 *        ratingA / ratingB = rating TOTALE delle squadre (somma dei giocatori)
 * @returns {{A: number, B: number}}
 */
export function puntiPartita({ ratingA, ratingB, golA, golB }) {
  if (golA === golB) {
    throw new Error("Pareggio non ammesso: si gioca il golden goal.");
  }

  const vinceA = golA > golB;
  const ratingVincente = vinceA ? ratingA : ratingB;
  const ratingPerdente = vinceA ? ratingB : ratingA;

  const scarto = Math.abs(golA - golB);
  const bonusGol = 0.5 * Math.floor(scarto / 3);
  const effettoRating = 0.5 * Math.floor(Math.abs(ratingA - ratingB) / 3);

  // Squadra che vince: parte da 3, minimo 0.
  let vincente = 3 + bonusGol;
  if (ratingVincente > ratingPerdente) vincente -= effettoRating; // era la favorita
  if (ratingVincente < ratingPerdente) vincente += effettoRating; // era la sfavorita
  vincente = Math.max(0, vincente);

  // Squadra che perde: parte da 0, non riceve mai punti dal rating.
  let perdente = -bonusGol;
  if (ratingPerdente > ratingVincente) perdente -= effettoRating; // era la favorita
  perdente += 0; // evita il "-0"

  return vinceA ? { A: vincente, B: perdente } : { A: perdente, B: vincente };
}
