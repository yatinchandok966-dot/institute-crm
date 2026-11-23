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
  connectionTimeoutMillis: 2500, // Quick timeout so fallback can engage smoothly if DB is offline
});

let isConnected = false;

const initDb = async (client) => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(30) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        duration_weeks INT NOT NULL,
        fee_amount NUMERIC(10, 2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS batches (
        id SERIAL PRIMARY KEY,
        batch_name VARCHAR(120) NOT NULL,
        course_id INT,
        instructor_name VARCHAR(120) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        schedule_time VARCHAR(100) NOT NULL,
        mode VARCHAR(30) DEFAULT 'hybrid',
        max_capacity INT DEFAULT 30,
        current_enrolled INT DEFAULT 0,
        status VARCHAR(30) DEFAULT 'upcoming',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        phone VARCHAR(25) NOT NULL,
        email VARCHAR(150),
        city VARCHAR(100),
        qualification VARCHAR(100),
        college_university VARCHAR(150),
        interested_course VARCHAR(150),
        lead_source VARCHAR(50) DEFAULT 'Website',
        assigned_counsellor VARCHAR(100) DEFAULT 'Admissions Desk',
        lead_status VARCHAR(50) DEFAULT 'New',
        priority VARCHAR(20) DEFAULT 'Warm',
        next_follow_up_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lead_notes (
        id SERIAL PRIMARY KEY,
        lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
        note_text TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lead_call_history (
        id SERIAL PRIMARY KEY,
        lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
        call_outcome VARCHAR(80) NOT NULL,
        duration VARCHAR(30) DEFAULT '2m 00s',
        remarks TEXT,
        counselor VARCHAR(100) NOT NULL,
        call_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id_code VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80),
        email VARCHAR(150),
        phone VARCHAR(25) NOT NULL,
        guardian_name VARCHAR(100),
        guardian_phone VARCHAR(25),
        address TEXT,
        date_of_birth DATE,
        enrollment_status VARCHAR(30) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id) ON DELETE CASCADE,
        course_id INT,
        batch_id INT,
        total_fee NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) DEFAULT 0.00,
        paid_fee NUMERIC(10, 2) DEFAULT 0.00,
        due_fee NUMERIC(10, 2) DEFAULT 0.00,
        enrollment_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(30) DEFAULT 'Enrolled'
      );

      CREATE TABLE IF NOT EXISTS fee_payments (
        id SERIAL PRIMARY KEY,
        enrollment_id INT,
        receipt_no VARCHAR(50) UNIQUE NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        payment_mode VARCHAR(40) NOT NULL,
        payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        received_by VARCHAR(100),
        notes TEXT
      );
    `);
    console.log('✅ PostgreSQL database schema verified and initialized.');
  } catch (err) {
    console.warn('⚠️ Could not initialize PostgreSQL tables:', err.message);
  }
};

// Test connection on load
pool.connect()
  .then(async (client) => {
    isConnected = true;
    console.log('✅ Connected to PostgreSQL database successfully.');
    await initDb(client);
    client.release();
  })
  .catch(err => {
    isConnected = false;
    console.warn('⚠️ PostgreSQL not reachable. Falling back to persistent disk data store (data_store.json).');
    console.warn(`   Reason: ${err.message}`);
    console.warn('   To connect PostgreSQL / Cloud SQL: update credentials in server/.env');
  });

export { pool, isConnected };
