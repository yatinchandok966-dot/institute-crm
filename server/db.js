import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to root .env / .env.local
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

// Resolve Neon hostname if needed (handles ISP DNS resolution issues via DoH fallback)
async function resolveNeonHost(hostname) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.Answer && data.Answer.length > 0) {
      const aRecords = data.Answer.filter(ans => ans.type === 1);
      if (aRecords.length > 0) {
        return aRecords[0].data;
      }
    }
  } catch (err) {
    // fallback if fetch fails
  }
  return hostname;
}

let poolConfig;
const rawUrl = databaseUrl;

if (rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const originalHostname = parsed.hostname;
    let connectHost = originalHostname;

    if (originalHostname.includes('neon.tech')) {
      const resolvedIp = await resolveNeonHost(originalHostname);
      if (resolvedIp) {
        connectHost = resolvedIp;
      }
    }

    poolConfig = {
      host: connectHost,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.replace(/^\//, '') || 'neondb',
      user: decodeURIComponent(parsed.username || 'neondb_owner'),
      password: decodeURIComponent(parsed.password || ''),
      ssl: {
        rejectUnauthorized: false,
        servername: originalHostname
      },
      connectionTimeoutMillis: 10000,
    };
  } catch (e) {
    poolConfig = {
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    };
  }
} else {
  poolConfig = {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'institute_crm',
    password: process.env.PGPASSWORD || 'postgres',
    port: parseInt(process.env.PGPORT || '5432', 10),
    connectionTimeoutMillis: 5000,
  };
}

const pool = new Pool(poolConfig);

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

      CREATE TABLE IF NOT EXISTS trainers (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(120) NOT NULL,
        role VARCHAR(100) DEFAULT 'Technical Trainer',
        department VARCHAR(100) DEFAULT 'Academic Faculty',
        phone VARCHAR(25) NOT NULL,
        email VARCHAR(150),
        qualification VARCHAR(100),
        experience VARCHAR(50),
        status VARCHAR(30) DEFAULT 'Active',
        bio TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        assigned_courses JSONB DEFAULT '[]'::jsonb,
        assigned_batches JSONB DEFAULT '[]'::jsonb,
        schedule JSONB DEFAULT '[]'::jsonb,
        joining_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admissions (
        id SERIAL PRIMARY KEY,
        admission_no VARCHAR(50) UNIQUE NOT NULL,
        application_no VARCHAR(50),
        student_name VARCHAR(120) NOT NULL,
        phone VARCHAR(25) NOT NULL,
        email VARCHAR(150),
        guardian_name VARCHAR(120),
        guardian_phone VARCHAR(25),
        address TEXT,
        course VARCHAR(150) NOT NULL,
        batch VARCHAR(120),
        duration VARCHAR(50),
        admission_date DATE DEFAULT CURRENT_DATE,
        total_course_fee NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) DEFAULT 0.00,
        discount_reason VARCHAR(150),
        net_fee NUMERIC(10, 2) NOT NULL,
        admission_fee_paid NUMERIC(10, 2) DEFAULT 0.00,
        fee_due NUMERIC(10, 2) DEFAULT 0.00,
        payment_plan VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Admission Confirmed',
        counselor VARCHAR(100) DEFAULT 'Admissions Desk',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Neon PostgreSQL database schema verified and initialized.');
  } catch (err) {
    console.warn('⚠️ Could not initialize PostgreSQL tables:', err.message);
  }
};

// Test connection on load
pool.connect()
  .then(async (client) => {
    isConnected = true;
    console.log('✅ Connected to Neon Cloud PostgreSQL database successfully.');
    await initDb(client);
    client.release();
  })
  .catch(err => {
    isConnected = false;
    console.error('❌ PostgreSQL connection error:', err.message);
  });

export { pool, isConnected };
