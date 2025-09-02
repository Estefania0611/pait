const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgresql://_6af43bcfa61f20e3:_7478c7d57c694fe6c9fc99a7cf9505@primary.clinica--txlmr772xj76.addon.code.run:5432/_7f50aa6458de?sslmode=require"
});
module.exports = pool;