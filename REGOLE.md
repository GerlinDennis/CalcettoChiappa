# Calcetto – Regole 26/27 e diario di bordo

App per gli amici del calcetto: si inserisce il risultato di ogni partita e si aggiorna la classifica.
Giocano almeno 10 persone, i giocatori cambiano, gli utenti totali sono circa 15 (iPhone e Android).
Tutto gratuito. Solo l'admin (e chi decide lui) può inserire o modificare; gli altri guardano soltanto.

Le squadre NON le fa l'app: le fate voi a parte. L'app serve solo per punti, rating e classifica.

---

## 1. Rating dei giocatori

- Ogni giocatore ha un rating di base: la **media delle valutazioni** date dagli amici. Si inserisce una volta.
- Il rating **attuale** parte dal rating di base e cambia **dopo ogni partita**, ma solo se il giocatore ne ha giocate **almeno 5**: si guardano le **ultime 5** e si **somma** al rating attuale:
  - più vittorie che sconfitte → **+1**
  - più sconfitte che vittorie → **−1**
- Fino alla 5ª partita il rating resta quello di base.
- Il ±1 è **cumulativo**: si somma al rating attuale, non al rating di base. Attenzione: chi vince spesso sale di 1 a ogni partita, quindi nel tempo i rating possono crescere o scendere molto. Da tenere d'occhio (si cambia in un solo punto: `src/rating.js`).
- L'admin può **modificare il rating a mano** quando vuole; da lì in poi gli aggiornamenti ripartono dal nuovo valore.
- Il rating usato per i punti di una partita viene **salvato nella partita**: cambiare un rating dopo non modifica i punti già assegnati.
- Il rating di una squadra = **somma** dei rating dei suoi giocatori.

## 2. Punti di una partita

Niente pareggi: se finisce in parità si gioca il golden goal (vince chi segna per primo).

Definizioni: **scarto** = differenza gol; **diff. rating** = differenza tra i rating totali delle due squadre.
Tutti i "ogni 3" sono **per difetto** (es. scarto 5 → conta 1 volta, non 2).

**Squadra che vince**
- parte da **3 punti**
- **+0,5** ogni 3 gol di scarto
- **−0,5** ogni 3 punti di diff. rating, se vince la squadra con il rating **più alto**
- **+0,5** ogni 3 punti di diff. rating, se vince la squadra con il rating **più basso**
- il risultato non scende mai sotto **0**

**Squadra che perde**
- parte da **0**
- **−0,5** ogni 3 gol di scarto
- **−0,5** ogni 3 punti di diff. rating, se perde la squadra con il rating **più alto**
- se perde la squadra con il rating più basso, il rating **non** cambia nulla (chi perde non riceve mai punti dal ranking)

Ogni giocatore prende i punti della propria squadra.

### Esempi (verificati con un calcolo)

| Rating A | Rating B | Risultato | Punti A | Punti B |
|---|---|---|---|---|
| 25 | 22 | A vince 7-1 | 3,5 | −1 |
| 20 | 26 | A vince 4-3 | 4 | −1 |
| 24 | 24 | A vince 5-1 | 3,5 | −0,5 |
| 24 | 24 | A vince 3-2 | 3 | 0 |
| 36 | 24 | A vince 4-3 | 1 | 0 |
| 42 | 24 | A vince 4-3 | 0 | 0 |
| 45 | 24 | A vince 4-3 | 0 (minimo) | 0 |

Casi dati da te per chiarire il perdente:
1. Rating uguali, perde 2-3 → **0**
2. Rating uguali, perde 1-7 → **−1**
3. Perde la squadra più forte di 6 punti, 2-3 → **−1**
4. Perde la squadra più debole di 6 punti, 2-3 → **0**

## 3. Classifica

Colonne: **Giocatore, Partite giocate, Punti totali, Differenza reti, Media punti.**
- Media punti = punti totali / partite giocate.
- Differenza reti di un giocatore = gol fatti − gol subiti dalle sue squadre nelle partite che ha giocato.
- Ordine di default: **punti totali**. Toccando "Media" si riordina per media.
- A parità, decide la **differenza reti**.

---

## Scelte e motivi (da non rimettere in discussione senza motivo)

- **Niente generatore di squadre:** le squadre le fate voi, quindi l'app è più semplice.
- **Solo l'admin modifica:** così nessuno può cambiare i punteggi per sbaglio o per scherzo.
- **Il perdente non prende mai punti dal rating:** scelta vostra, per non premiare chi perde.
- **Minimo 0 per chi vince:** chi vince non deve mai finire sotto zero per colpa del rating.
- **Web app (PWA) invece di app da store:** gratis, funziona su iPhone e Android, nessun account a pagamento.
- **Nessun login nell'app:** i dati sono un file (`dati.json`) che solo chi ha accesso al GitHub del progetto può cambiare; gli amici leggono soltanto. Gli altri admin si aggiungono come collaboratori del progetto. Inserimento solo dal PC (scelta confermata).
- **Dati salvati come elenco di eventi (non come stato):** così si può annullare o correggere una riga e tutto si ricalcola.
- **Rating salvato in ogni partita:** così i punti già assegnati non cambiano mai, anche se un rating viene modificato dopo.
- **Nessun ±1 prima della 5ª partita:** finché non ci sono 5 partite il rating resta quello di base.
- **±1 cumulativo dopo ogni partita:** scelta dell'admin, anche se fa crescere i rating più in fretta (vedi "Da decidere").

## Da decidere / da controllare

- **Squadre di dimensione diversa** (es. 4 contro 5): l'app non lo controlla; la somma dei rating ne risentirebbe. Da decidere se vietarlo.
- **Crescita dei rating:** con il ±1 cumulativo dopo ogni partita i rating possono andare molto in alto o in basso. Se dà problemi, valutare un limite oppure l'aggiornamento ogni 5 partite.
- **Tecnologia:** pagina su GitHub Pages / Netlify / Cloudflare Pages, dati su Firebase o Supabase (piani gratuiti). Da scegliere.

## Prossimi passi

1. ✅ Calcolo dei punti (`src/punti.js`).
2. ✅ Rating, registrazione partita e classifica (`src/rating.js`, `src/stato.js`, `src/classifica.js`), con test.
3. ✅ Salvataggio dati (`dati.json`) e comandi per l'admin (`src/cli.js`), senza login.
4. ✅ Pagina con classifica e ultime partite, installabile sul telefono (`index.html`).
5. Pubblicare la pagina su GitHub Pages (gratis) e farla provare agli amici.
6. Poi, se serve: inserire le partite dal telefono (richiederebbe un login).
