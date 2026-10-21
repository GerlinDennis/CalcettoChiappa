// I dati salvati sono un ELENCO DI EVENTI, nell'ordine in cui sono successi:
//   { "tipo": "giocatore", "id": "marco", "nome": "Marco", "rating": 6 }
//   { "tipo": "rating",    "id": "marco", "rating": 7 }
//   { "tipo": "partita",   "squadraA": ["marco","luca"], "squadraB": ["gino","dario"],
//                          "golA": 4, "golB": 1, "data": "2026-10-21" }
// Lo stato (rating attuali, classifica...) si ricostruisce rifacendo gli eventi uno dopo l'altro.
// Vantaggio: per correggere un errore basta togliere o modificare una riga e tutto si ricalcola.
//
// Questo file funziona sia in Node sia nel browser (non usa nulla di specifico di Node).

import { nuovoStato, aggiungiGiocatore, impostaRating, registraPartita } from "./stato.js";

/** Applica un evento a uno stato e restituisce il nuovo stato. */
export function applica(stato, evento) {
  switch (evento.tipo) {
    case "giocatore":
      return aggiungiGiocatore(stato, evento.id, evento.nome, evento.rating);
    case "rating":
      return impostaRating(stato, evento.id, evento.rating);
    case "partita":
      return registraPartita(stato, evento);
    default:
      throw new Error(`Tipo di evento sconosciuto: ${evento.tipo}`);
  }
}

/** Ricostruisce lo stato rifacendo tutti gli eventi. Se uno e sbagliato, dice quale. */
export function costruisciStato(eventi) {
  let stato = nuovoStato();
  eventi.forEach((evento, i) => {
    try {
      stato = applica(stato, evento);
    } catch (errore) {
      throw new Error(`Evento n. ${i + 1} non valido: ${errore.message}`);
    }
  });
  return stato;
}
