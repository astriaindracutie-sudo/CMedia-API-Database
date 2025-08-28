// backend/src/utils/db.js

import mariadb from "mariadb";

// The dotenv configuration has been removed from here.
// The environment variables will now be loaded exclusively by the main index.js file.

// Create MariaDB connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  connectTimeout: 15000,
  acquireTimeout: 15000,
});

// Connection testing is handled in index.js when the server starts

export default pool;
