const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
const port = process.env.PORT || 3000;

// Reemplazar la creación de conexión actual con un pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Agregar después de crear el pool
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Se perdió la conexión con la base de datos');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada');
    }
  }
  if (connection) connection.release();
});

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola, mundo desde Vercel con Node.js!');
});

app.get('/usuarios', (req, res) => {
  pool.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
