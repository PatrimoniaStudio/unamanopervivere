import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ */
/*  Database — Postgres (fornito gratuitamente da Render)              */
/* ------------------------------------------------------------------ */

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  Variabile DATABASE_URL non impostata. Collega un database Postgres su Render e imposta questa variabile d'ambiente."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

ensureTable().catch((err) => {
  console.error("Errore nella creazione della tabella app_data:", err);
});

/* ------------------------------------------------------------------ */
/*  App Express                                                        */
/* ------------------------------------------------------------------ */

const app = express();
app.use(express.json({ limit: "5mb" }));

// Chiave/valore semplice: tutta l'app la usa per salvare donazioni, donatori, impostazioni.
app.get("/api/storage/:key", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM app_data WHERE key = $1", [req.params.key]);
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json({ key: req.params.key, value: rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

app.put("/api/storage/:key", async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: "missing_value" });
    await pool.query(
      `INSERT INTO app_data (key, value, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = now()`,
      [req.params.key, JSON.stringify(value)]
    );
    res.json({ key: req.params.key, value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

app.delete("/api/storage/:key", async (req, res) => {
  try {
    await pool.query("DELETE FROM app_data WHERE key = $1", [req.params.key]);
    res.json({ key: req.params.key, deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ------------------------------------------------------------------ */
/*  Serve il frontend già compilato (npm run build -> /dist)           */
/* ------------------------------------------------------------------ */

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
