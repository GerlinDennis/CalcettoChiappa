// Comandi per l'admin. Si lanciano da terminale, nella cartella del progetto:
//   node src/cli.js giocatore marco Marco 6
//   node src/cli.js partita marco,luca,gino,dario,enrico fabio,livio,mario,nico,bruno 5 3
//   node src/cli.js classifica
// Ogni comando che modifica i dati riscrive dati.json.

import { leggiEventi, salvaEventi } from "./archivio.js";
import { applica, costruisciStato } from "./eventi.js";
import { calcolaClassifica } from "./classifica.js";

const USO = `Comandi:
  node src/cli.js giocatore <id> <nome> <rating>        aggiunge un giocatore
  node src/cli.js rating <id> <nuovo-rating>            cambia a mano il rating
  node src/cli.js partita <squadraA> <squadraB> <golA> <golB>
                                                        squadre = id separati da virgola, senza spazi
  node src/cli.js annulla                               toglie l'ultima voce inserita
  node src/cli.js classifica [media]                    mostra la classifica (per punti o per media)`;

const fmt = (n) => String(n).replace(".", ","); // 3.5 -> 3,5

function numero(testo, nome) {
  const n = Number(String(testo).replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`${nome} deve essere un numero (ricevuto: ${testo})`);
  return n;
}

function richiedi(args, quanti) {
  if (args.length !== quanti) throw new Error(`Numero di argomenti sbagliato.\n\n${USO}`);
}

async function main(argv) {
  const [comando, ...args] = argv;
  const eventi = await leggiEventi();
  const stato = costruisciStato(eventi);

  switch (comando) {
    case "giocatore": {
      richiedi(args, 3);
      const evento = { tipo: "giocatore", id: args[0], nome: args[1], rating: numero(args[2], "rating") };
      applica(stato, evento); // controlla che sia valido prima di salvare
      await salvaEventi([...eventi, evento]);
      console.log(`Aggiunto ${evento.nome} (${evento.id}) con rating ${fmt(evento.rating)}.`);
      break;
    }

    case "rating": {
      richiedi(args, 2);
      const evento = { tipo: "rating", id: args[0], rating: numero(args[1], "rating") };
      applica(stato, evento);
      await salvaEventi([...eventi, evento]);
      console.log(`Rating di ${args[0]} impostato a ${fmt(evento.rating)}.`);
      break;
    }

    case "partita": {
      richiedi(args, 4);
      const lista = (testo) => testo.split(",").map((s) => s.trim()).filter(Boolean);
      const evento = {
        tipo: "partita",
        squadraA: lista(args[0]),
        squadraB: lista(args[1]),
        golA: numero(args[2], "golA"),
        golB: numero(args[3], "golB"),
        data: new Date().toISOString().slice(0, 10),
      };
      const nuovo = applica(stato, evento);
      await salvaEventi([...eventi, evento]);

      const p = nuovo.partite.at(-1);
      console.log(`Partita n. ${p.id}: ${p.golA}-${p.golB}  (rating squadre ${fmt(p.ratingA)} contro ${fmt(p.ratingB)})`);
      console.log(`  Squadra A: ${fmt(p.puntiA)} punti a testa`);
      console.log(`  Squadra B: ${fmt(p.puntiB)} punti a testa`);
      const cambi = [...p.squadraA, ...p.squadraB]
        .filter((id) => nuovo.giocatori[id].rating !== stato.giocatori[id].rating)
        .map((id) => `${nuovo.giocatori[id].nome} ${fmt(stato.giocatori[id].rating)} -> ${fmt(nuovo.giocatori[id].rating)}`);
      if (cambi.length) console.log(`  Rating cambiati: ${cambi.join(", ")}`);
      break;
    }

    case "annulla": {
      richiedi(args, 0);
      if (eventi.length === 0) throw new Error("Non c'e niente da annullare.");
      const ultimo = eventi.at(-1);
      await salvaEventi(eventi.slice(0, -1));
      console.log(`Annullato: ${JSON.stringify(ultimo)}`);
      break;
    }

    case "classifica": {
      const ordinaPer = args[0] === "media" ? "media" : "punti";
      const righe = calcolaClassifica(stato, { ordinaPer });
      if (righe.length === 0) {
        console.log("Ancora nessuna partita.");
        break;
      }
      console.log(`Classifica (ordinata per ${ordinaPer})`);
      console.log("  #  Giocatore        Part.  Punti  Diff.  Media");
      righe.forEach((r, i) => {
        console.log(
          `${String(i + 1).padStart(3)}  ${r.nome.padEnd(15)} ${String(r.partite).padStart(5)}  ` +
            `${fmt(r.punti).padStart(5)}  ${String(r.diffReti).padStart(5)}  ${fmt(Math.round(r.media * 100) / 100).padStart(5)}`,
        );
      });
      break;
    }

    default:
      console.log(USO);
  }
}

main(process.argv.slice(2)).catch((errore) => {
  console.error("Errore: " + errore.message);
  process.exit(1);
});
