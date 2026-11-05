// Classifica, secondo REGOLE.md (sezione 3).
// Colonne: giocatore, partite, punti totali, differenza reti, media punti.
// Ordine di default: punti totali; a richiesta: media. A parita decide la differenza reti,
// e se e ancora parita l'ordine alfabetico del nome.
// Chi ha giocato meno di 1/3 delle partite totali e "senza voto" (SV): sta in fondo, senza posizione.

/**
 * @param {object} stato
 * @param {{ordinaPer?: "punti"|"media"}} [opzioni]
 * @returns {{id: string, nome: string, partite: number, punti: number, diffReti: number, media: number, sv: boolean, pos: number|null}[]}
 */
export function calcolaClassifica(stato, { ordinaPer = "punti" } = {}) {
  const righe = {};
  const riga = (id) =>
    (righe[id] ??= { id, nome: stato.giocatori[id].nome, partite: 0, punti: 0, diffReti: 0, media: 0 });

  for (const p of stato.partite) {
    for (const id of p.squadraA) {
      const r = riga(id);
      r.partite += 1;
      r.punti += p.puntiA;
      r.diffReti += p.golA - p.golB;
    }
    for (const id of p.squadraB) {
      const r = riga(id);
      r.partite += 1;
      r.punti += p.puntiB;
      r.diffReti += p.golB - p.golA;
    }
  }

  const lista = Object.values(righe);
  for (const r of lista) {
    r.media = r.punti / r.partite;
    r.sv = r.partite * 3 < stato.partite.length;
  }

  const chiave = ordinaPer === "media" ? "media" : "punti";
  lista.sort(
    (a, b) =>
      a.sv - b.sv || b[chiave] - a[chiave] || b.diffReti - a.diffReti || a.nome.localeCompare(b.nome),
  );
  lista.forEach((r, i) => {
    r.pos = r.sv ? null : i + 1;
  });
  return lista;
}
