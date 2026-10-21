// Lettura e scrittura di dati.json (solo per Node: i comandi dell'admin e i test).
// Il file ha un evento per riga, cosi su GitHub si vede bene cosa e cambiato
// e correggere una riga a mano e facile.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Percorso di default: dati.json nella cartella principale del progetto.
// Per i test si puo cambiare con la variabile d'ambiente DATI.
export const PERCORSO_DATI = process.env.DATI ?? fileURLToPath(new URL("../dati.json", import.meta.url));

export async function leggiEventi(percorso = PERCORSO_DATI) {
  try {
    const dati = JSON.parse(await readFile(percorso, "utf8"));
    return dati.eventi ?? [];
  } catch (errore) {
    if (errore.code === "ENOENT") return []; // file non ancora creato
    throw errore;
  }
}

export async function salvaEventi(eventi, percorso = PERCORSO_DATI) {
  const righe = eventi.map((e) => "    " + JSON.stringify(e));
  const corpo = righe.length ? `[\n${righe.join(",\n")}\n  ]` : "[]";
  await writeFile(percorso, `{\n  "eventi": ${corpo}\n}\n`, "utf8");
}
