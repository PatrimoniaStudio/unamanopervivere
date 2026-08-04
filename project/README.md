# Gestionale donazioni — Una Mano Per Vivere ODV-ETS

App web per la gestione di donazioni, ricevute e anagrafica donatori, con esportazione Excel.
Frontend React (compilato con **esbuild**) + backend Express + database Postgres, pensata per
essere pubblicata gratuitamente su **Render**, con il codice ospitato su **GitHub**.

## Come funziona

- Il frontend (`src/`) è l'interfaccia che usa il direttivo.
- Il backend (`server.js`) espone poche API (`/api/storage/:key`) che leggono e scrivono i dati
  su un database Postgres. È lo stesso server che, una volta compilato il frontend, serve anche
  le pagine dell'app: un solo servizio su Render, niente configurazioni complicate.
- I dati (donazioni, donatori, impostazioni associazione) sono condivisi automaticamente tra
  tutti quelli che aprono il sito: non c'è login separato per persona, quindi condividete il
  link solo con chi deve usarlo.

## Pubblicazione passo passo

### 1. Caricare il codice su GitHub

1. Create un nuovo repository su [github.com](https://github.com) (può essere privato).
2. Da questa cartella, sul vostro computer:
   ```bash
   git init
   git add .
   git commit -m "Prima versione gestionale donazioni"
   git branch -M main
   git remote add origin https://github.com/VOSTRO-UTENTE/NOME-REPO.git
   git push -u origin main
   ```
   In alternativa, su GitHub potete trascinare l'intera cartella del progetto nella pagina
   "Upload files" del repository: preserva la struttura delle sottocartelle automaticamente.

### 2. Creare il database su Render

1. Su [render.com](https://render.com), **New +** → **PostgreSQL**.
2. Datele un nome (es. `unamanopervivere-db`), piano **Free**, create il database.
3. Aspettate che sia pronto: comparirà una **Internal Database URL** — vi servirà al passo dopo
   (Render la collega da sola se seguite il passo 3B).

### 3. Creare il servizio web

1. Su Render, **New +** → **Web Service**.
2. Collegate il repository GitHub appena creato.
3. Impostazioni:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. In **Environment**, aggiungete la variabile `DATABASE_URL`:
   - **3A. Più semplice**: usate il pulsante "Add from Database" / collegate il database Postgres
     creato al passo 2 — Render imposta `DATABASE_URL` da sola.
   - **3B. Manuale**: incollate voi la Internal (o External) Database URL del passo 2.
5. **Create Web Service**. Il primo deploy richiede qualche minuto.

Al termine avrete un indirizzo del tipo `https://unamanopervivere.onrender.com` — quello è il
vostro sito, utilizzabile da chiunque abbia il link, da qualunque dispositivo.

> Nota: sul piano gratuito di Render, il servizio "si addormenta" dopo un periodo di inattività
> e il primo caricamento dopo una pausa può richiedere una decina di secondi: è normale, i dati
> non vengono persi (sono sul database, non sul servizio web).

### 4. Aggiornare l'app in futuro

Ogni volta che modificate il codice e fate `git push`, Render ricompila e pubblica da sola la
nuova versione (deploy automatico già attivo di default).

## Sviluppo in locale (facoltativo)

```bash
npm install
npm run build         # compila una volta in dist/
npm run dev:server    # avvia il server su http://localhost:3000
```
Per rigenerare la build automaticamente mentre modificate `src/App.jsx`, in un altro terminale:
```bash
npm run dev:build
```
Per il backend in locale serve comunque un Postgres raggiungibile: potete usare quello di Render
(copiate la External Database URL in un file `.env`, vedi `.env.example`) oppure un Postgres
installato sul vostro computer.

## Struttura del progetto

```
├── server.js            backend Express + API di salvataggio dati (Postgres)
├── scripts/
│   └── build.js          compila src/ in dist/ usando esbuild
├── public/
│   └── index.html         pagina HTML sorgente (copiata in dist/ durante la build)
├── src/
│   ├── App.jsx            l'intera applicazione (donazioni, donatori, ricevute, impostazioni)
│   └── main.jsx            punto d'ingresso React
└── package.json
```
