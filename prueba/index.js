const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
const port = process.env.PORT || 3000;

// Agregar antes de crear el pool
dns.lookup(process.env.DB_HOST, (err, address, family) => {
  console.log('Resolución DNS para', process.env.DB_HOST, ':', {
    error: err ? err.message : 'ninguno',
    address: address,
    family: family
  });
});

// Reemplazar la creación de conexión actual con un pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'sql301.byethost.com',
  port: 3306,
  user: process.env.DB_USER || 'if0_37892242',
  password: process.env.DB_PASS || 'ttiaToaAGAzh',
  database: process.env.DB_NAME || 'if0_37892242_backendderechopeticion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Agregar logging detallado para diagnóstico
console.log('Intentando conectar a MySQL con:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: 3306
});

// Agregar después de crear el pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error detallado de conexión:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Se perdió la conexión con la base de datos');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada');
      console.error('Verifica que el host y puerto sean correctos:', process.env.DB_HOST);
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
