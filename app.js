// La pagina: legge dati.json, ricostruisce lo stato e disegna classifica e ultime partite.
// Usa gli stessi file di src/ che usano i comandi dell'admin, quindi i conti sono identici.

import { costruisciStato } from "./src/eventi.js";
import { calcolaClassifica } from "./src/classifica.js";

const numero = (n) => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(n);
const dataBreve = (iso) => (iso ? iso.split("-").reverse().slice(0, 2).join("/") : "");
const dataLunga = (iso) => iso.split("-").reverse().join("/");

// Crea un elemento HTML. I testi passano da append(): niente HTML iniettato dai nomi.
function el(tag, attributi = {}, ...figli) {
  const nodo = document.createElement(tag);
  for (const [chiave, valore] of Object.entries(attributi)) nodo.setAttribute(chiave, valore);
  nodo.append(...figli);
  return nodo;
}

let stato = null;
let ordinaPer = "punti";

function disegnaClassifica() {
  const contenitore = document.getElementById("classifica");
  const righe = calcolaClassifica(stato, { ordinaPer });

  if (righe.length === 0) {
    contenitore.replaceChildren(el("p", { class: "vuoto" }, "Ancora nessuna partita."));
    return;
  }

  const colonne = [
    ["#", "pos", null],
    ["Giocatore", "nome", null],
    ["Part.", "", null],
    ["Punti", "", "punti"],
    ["Diff.", "", null],
    ["Media", "", "media"],
  ];
  const intestazione = el(
    "tr",
    {},
    ...colonne.map(([testo, classe, chiave]) =>
      el("th", { scope: "col", class: [classe, chiave === ordinaPer ? "attiva" : ""].join(" ").trim() }, testo),
    ),
  );

  const corpo = righe.map((r, i) =>
    el(
      "tr",
      {},
      el("td", { class: "pos" }, String(i + 1)),
      el("td", { class: "nome" }, r.nome),
      el("td", {}, String(r.partite)),
      el("td", { class: ordinaPer === "punti" ? "attiva" : "" }, numero(r.punti)),
      el("td", {}, (r.diffReti > 0 ? "+" : "") + r.diffReti),
      el("td", { class: ordinaPer === "media" ? "attiva" : "" }, numero(r.media)),
    ),
  );

  contenitore.replaceChildren(el("table", { class: "tabella" }, el("thead", {}, intestazione), el("tbody", {}, ...corpo)));
}

function disegnaPartite() {
  const lista = document.getElementById("partite");
  const ultime = stato.partite.slice(-5).reverse();

  if (ultime.length === 0) {
    lista.replaceChildren(el("li", { class: "vuoto" }, "Nessuna partita giocata."));
    return;
  }

  const nomi = (ids) => ids.map((id) => stato.giocatori[id].nome).join(", ");
  const squadra = (ids, gol, punti, vince) =>
    el(
      "div",
      { class: `squadra ${vince ? "vincente" : "perdente"}` },
      el("span", { class: "giocatori" }, nomi(ids)),
      el(
        "span",
        { class: "esito" },
        el("span", { class: "gol" }, String(gol)),
        el("span", { class: `punti${punti < 0 ? " negativo" : ""}` }, `${punti > 0 ? "+" : ""}${numero(punti)} pt`),
      ),
    );

  lista.replaceChildren(
    ...ultime.map((p) =>
      el(
        "li",
        { class: "partita" },
        el("div", { class: "testa-partita" }, el("span", {}, `Partita ${p.id}`), el("span", {}, dataBreve(p.data))),
        squadra(p.squadraA, p.golA, p.puntiA, p.golA > p.golB),
        squadra(p.squadraB, p.golB, p.puntiB, p.golB > p.golA),
      ),
    ),
  );
}

function disegnaTestata() {
  const nGiocatori = Object.keys(stato.giocatori).length;
  const nPartite = stato.partite.length;
  const ultima = stato.partite.at(-1);
  document.getElementById("aggiornamento").textContent = ultima
    ? `${nPartite} partite · ${nGiocatori} giocatori${ultima.data ? ` · ultima il ${dataLunga(ultima.data)}` : ""}`
    : `${nGiocatori} giocatori · nessuna partita ancora`;
}

function mostraErrore(messaggio) {
  document.getElementById("aggiornamento").textContent = "Qualcosa non va";
  document.getElementById("classifica").replaceChildren(el("p", { class: "errore" }, messaggio));
  document.getElementById("partite").replaceChildren();
}

async function avvia() {
  try {
    const risposta = await fetch("dati.json", { cache: "no-store" });
    if (!risposta.ok) throw new Error(`dati.json non trovato (errore ${risposta.status})`);
    const { eventi } = await risposta.json();
    stato = costruisciStato(eventi ?? []);
  } catch (errore) {
    mostraErrore(`Non riesco a leggere i dati. ${errore.message}`);
    return;
  }
  disegnaTestata();
  disegnaClassifica();
  disegnaPartite();
}

for (const bottone of document.querySelectorAll(".scelta button")) {
  bottone.addEventListener("click", () => {
    ordinaPer = bottone.dataset.ordine;
    for (const b of document.querySelectorAll(".scelta button")) {
      b.setAttribute("aria-pressed", String(b === bottone));
    }
    if (stato) disegnaClassifica();
  });
}

avvia();
