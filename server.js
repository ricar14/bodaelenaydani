
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configurar conexión incluyendo SSL en producción (Render requiere SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Crear tabla si no existe
pool.query(`CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  guests INTEGER NOT NULL
)`)
  .then(() => console.log('Tabla guests lista'))
  .catch(err => console.error('Error creando tabla:', err));


// Add guest
app.post('/api/guests', async (req, res) => {
  const { name, email, guests } = req.body;
  if (!name || !guests) return res.status(400).json({ error: 'Nombre y número de invitados requeridos.' });
  try {
    const result = await pool.query(
      'INSERT INTO guests (name, email, guests) VALUES ($1, $2, $3) RETURNING id',
      [name, email || '', guests]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Ya se ha registrado el invitado.' });
    } else {
      res.status(500).json({ error: 'Error al registrar invitado.' });
    }
  }
});


// Get all guests
app.get('/api/guests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guests');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar invitados.' });
  }
});


// Delete guest by id
app.delete('/api/guests/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM guests WHERE id = $1', [req.params.id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar invitado.' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
