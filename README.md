# Calcetto – punteggi e classifica

Le regole (punti, rating, classifica) sono in **REGOLE.md**. Questo file spiega come si usa il progetto.

I comandi sotto usano `node` direttamente (non `npm`) perché PowerShell blocca gli script di npm.
Tutti si lanciano dalla cartella del progetto.

## Inserire i dati (solo admin, dal PC)

```
node src/cli.js giocatore marco Marco 6
node src/cli.js partita marco,luca,gino,dario,enrico fabio,livio,mario,nico,bruno 5 3
node src/cli.js rating marco 7
node src/cli.js annulla
node src/cli.js classifica
node src/cli.js classifica media
```

- `giocatore <id> <nome> <rating>`: aggiunge un giocatore. L'id è breve, senza spazi né maiuscole (es. `marco`).
- `partita <squadraA> <squadraB> <golA> <golB>`: le squadre sono id separati da virgola, **senza spazi**.
  Il comando stampa i punti di ogni squadra e i rating che sono cambiati.
- `rating <id> <valore>`: cambia a mano il rating di un giocatore.
- `annulla`: toglie l'ultima voce inserita (utile se hai sbagliato un risultato).
- `classifica [media]`: mostra la classifica nel terminale.

I dati stanno in `dati.json`, un evento per riga. Se serve correggere qualcosa di più vecchio puoi
modificare o cancellare la riga a mano: all'apertura tutto viene ricalcolato, e se una riga è
sbagliata il messaggio dice quale.

## Vedere la pagina sul PC

```
node serve.js
```

Poi apri http://localhost:8080 (si ferma con Ctrl+C). Aprire `index.html` con un doppio clic **non**
funziona: il browser blocca la lettura di `dati.json`.

Per provare la pagina con dati finti: copia `dati.esempio.json` sopra `dati.json`
(**attenzione**: sovrascrive i dati veri, quindi fallo solo prima di inserirne di tuoi).

## Provare i test

```
node --test
```

## Sul telefono

Quando la pagina sarà pubblicata (GitHub Pages), gli amici aprono il link e scelgono:
- iPhone: Safari → pulsante Condividi → "Aggiungi a Home"
- Android: Chrome → menu ⋮ → "Aggiungi a schermata Home" / "Installa app"

Ancora non funziona senza connessione.

## Com'è fatto

| File | A cosa serve |
|---|---|
| `src/punti.js` | punti di una partita |
| `src/rating.js` | ±1 sul rating |
| `src/stato.js` | giocatori e partite, registra una partita |
| `src/eventi.js` | ricostruisce lo stato da `dati.json` |
| `src/classifica.js` | classifica |
| `src/archivio.js`, `src/cli.js` | leggere/scrivere `dati.json` e comandi dell'admin (solo Node) |
| `index.html`, `app.js`, `stile.css` | la pagina per gli amici |
| `manifest.webmanifest`, `icon-*.png` | per installarla sul telefono |
| `serve.js` | server locale per provare la pagina |
| `test/` | test automatici |
