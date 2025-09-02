const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL no definida en el .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL usando DATABASE_URL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a la base de datos', err);
});

module.exports = pool;