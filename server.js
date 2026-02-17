import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite DB
const db = new sqlite3.Database('./guests.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    email TEXT,
    guests INTEGER
  )`);
});

// Add guest
app.post('/api/guests', (req, res) => {
  const { name, email, guests } = req.body;
  if (!name || !guests) return res.status(400).json({ error: 'Nombre y número de invitados requeridos.' });
  db.run('INSERT INTO guests (name, email, guests) VALUES (?, ?, ?)', [name, email || '', guests], function(err) {
    if (err) return res.status(409).json({ error: 'Ya se ha registrado el invitado.' });
    res.json({ id: this.lastID });
  });
});

// Get all guests
app.get('/api/guests', (req, res) => {
  db.all('SELECT * FROM guests', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar invitados.' });
    res.json(rows);
  });
});

// Delete guest by id
app.delete('/api/guests/:id', (req, res) => {
  db.run('DELETE FROM guests WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar invitado.' });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
