import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ host:'localhost', user:'postgres', password:'Yatin@7526', database:'institute_crm', port:5432 });

console.log('Clearing all data...');
await pool.query('DELETE FROM fee_payments');
await pool.query('DELETE FROM enrollments');
await pool.query('DELETE FROM admissions');
await pool.query('DELETE FROM lead_call_history');
await pool.query('DELETE FROM lead_notes');
await pool.query('DELETE FROM leads');
await pool.query('DELETE FROM students');
await pool.query('DELETE FROM batches');
await pool.query('DELETE FROM courses');
await pool.query('DELETE FROM trainers');
console.log('All cleared!');

const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
console.log('\nAll tables in database:');
for(const t of r.rows) {
  const c = await pool.query('SELECT COUNT(*) as cnt FROM ' + t.tablename);
  console.log('  ' + t.tablename + ': ' + c.rows[0].cnt + ' rows');
}
await pool.end();
