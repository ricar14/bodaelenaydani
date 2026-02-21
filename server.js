
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializar cliente DB: usar Postgres si DATABASE_URL existe, sino SQLite local
let dbType = 'sqlite';
let pool = null;
let sqliteDb = null;
const DB_URL = (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('postgresql://usuario')) ? process.env.DATABASE_URL : null;
if (DB_URL) {
  dbType = 'pg';
  pool = new Pool({
    connectionString: DB_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  // Crear tabla en Postgres si no existe
  pool.query(`CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    email TEXT,
    guests INTEGER NOT NULL
  )`).then(() => console.log('Tabla guests lista (pg)')).catch(err => console.error('Error creando tabla (pg):', err));
} else {
  // SQLite fallback para desarrollo local
  sqlite3.verbose();
  sqliteDb = new sqlite3.Database('./local.db', (err) => {
    if (err) console.error('Error abriendo SQLite DB:', err);
    else console.log('Usando SQLite local ./local.db');
  });
  // Crear tabla si no existe
  sqliteDb.run(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    email TEXT,
    guests INTEGER NOT NULL
  )`, (err) => {
    if (err) console.error('Error creando tabla (sqlite):', err);
    else console.log('Tabla guests lista (sqlite)');
  });
}

// Health check endpoint (placed after DB init so it can use the correct client)
app.get('/health', async (req, res) => {
  try {
    if (dbType === 'pg') {
      const result = await pool.query('SELECT 1');
      if (result) return res.json({ status: 'ok' });
    } else {
      sqliteDb.get('SELECT 1 as ok', [], (err, row) => {
        if (err) return res.status(500).json({ status: 'db-error', error: String(err) });
        return res.json({ status: 'ok' });
      });
      return;
    }
  } catch (err) {
    return res.status(500).json({ status: 'db-error', error: String(err) });
  }
  res.json({ status: 'ok' });
});


// Add guest
app.post('/api/guests', async (req, res) => {
  const { name, email, guests } = req.body;
  if (!name || !guests) return res.status(400).json({ error: 'Nombre y número de invitados requeridos.' });
  try {
    if (dbType === 'pg') {
      const result = await pool.query(
        'INSERT INTO guests (name, email, guests) VALUES ($1, $2, $3) RETURNING id',
        [name, email || '', guests]
      );
      return res.json({ id: result.rows[0].id });
    } else {
      // sqlite
      sqliteDb.run('INSERT INTO guests (name, email, guests) VALUES (?, ?, ?)', [name, email || '', guests], function(err) {
        if (err) {
          if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Ya se ha registrado el invitado.' });
          return res.status(500).json({ error: 'Error al registrar invitado.' });
        }
        return res.json({ id: this.lastID });
      });
    }
  } catch (err) {
    console.error('Error en POST /api/guests:', err);
    res.status(500).json({ error: 'Error al registrar invitado.' });
  }
});


// Get all guests
app.get('/api/guests', async (req, res) => {
  try {
    if (dbType === 'pg') {
      const result = await pool.query('SELECT * FROM guests');
      return res.json(result.rows);
    } else {
      sqliteDb.all('SELECT * FROM guests', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar invitados.' });
        return res.json(rows);
      });
    }
  } catch (err) {
    console.error('Error en GET /api/guests:', err);
    res.status(500).json({ error: 'Error al consultar invitados.' });
  }
});


// Delete guest by id
app.delete('/api/guests/:id', async (req, res) => {
  try {
    if (dbType === 'pg') {
      const result = await pool.query('DELETE FROM guests WHERE id = $1', [req.params.id]);
      return res.json({ deleted: result.rowCount });
    } else {
      sqliteDb.run('DELETE FROM guests WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar invitado.' });
        return res.json({ deleted: this.changes });
      });
    }
  } catch (err) {
    console.error('Error en DELETE /api/guests/:id:', err);
    res.status(500).json({ error: 'Error al eliminar invitado.' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
