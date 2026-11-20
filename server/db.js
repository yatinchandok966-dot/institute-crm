import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection Pool configuration
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'institute_crm',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432', 10),
  connectionTimeoutMillis: 2000, // Quick timeout so fallback can engage smoothly if DB is offline
});

let isConnected = false;

// Test connection on load
pool.connect()
  .then(client => {
    isConnected = true;
    console.log('✅ Connected to PostgreSQL database successfully.');
    client.release();
  })
  .catch(err => {
    isConnected = false;
    console.warn('⚠️ PostgreSQL not reachable on port 5432. Falling back to in-memory institute demo data store.');
    console.warn(`   Reason: ${err.message}`);
    console.warn('   To connect PostgreSQL: ensure Postgres service is running, create "institute_crm" database, and run schema.sql');
  });

export { pool, isConnected };
