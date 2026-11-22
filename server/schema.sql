-- =========================================================
-- PostgreSQL Schema for Institute CRM (Courses & Academy)
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Staff Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'counselor', -- 'admin', 'counselor', 'instructor', 'accountant'
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g. 'Software Dev', 'Data Science', 'Design', 'Marketing'
    duration_weeks INT NOT NULL,
    fee_amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(120) NOT NULL,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    instructor_name VARCHAR(120) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    schedule_time VARCHAR(100) NOT NULL, -- e.g. 'Mon-Fri 10:00 AM - 12:00 PM'
    mode VARCHAR(30) DEFAULT 'hybrid', -- 'offline', 'online', 'hybrid'
    max_capacity INT DEFAULT 30,
    current_enrolled INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads / Inquiries Table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100),
    qualification VARCHAR(100),
    college_university VARCHAR(150),
    interested_course VARCHAR(150),
    lead_source VARCHAR(50) DEFAULT 'Website', -- 'Website', 'Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Referral', 'Walk-in', 'Phone Call'
    assigned_counsellor VARCHAR(100) DEFAULT 'Pooja Verma',
    lead_status VARCHAR(50) DEFAULT 'New', -- 'New', 'Contacted', 'Counselling Scheduled', 'Interested', 'Follow-up Required', 'Converted / Lost'
    priority VARCHAR(20) DEFAULT 'Warm', -- 'Hot', 'Warm', 'Cold'
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lead Notes History
CREATE TABLE IF NOT EXISTS lead_notes (
    id SERIAL PRIMARY KEY,
    lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lead Call Logs & Telephonic History
CREATE TABLE IF NOT EXISTS lead_call_history (
    id SERIAL PRIMARY KEY,
    lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
    call_outcome VARCHAR(80) NOT NULL, -- e.g. 'Connected - Interested', 'Counselling Scheduled', etc.
    duration VARCHAR(30) DEFAULT '2m 00s',
    remarks TEXT,
    counselor VARCHAR(100) NOT NULL,
    call_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(25) NOT NULL,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(25),
    address TEXT,
    date_of_birth DATE,
    enrollment_status VARCHAR(30) DEFAULT 'Active', -- 'Active', 'Completed', 'Dropped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE RESTRICT,
    batch_id INT REFERENCES batches(id) ON DELETE SET NULL,
    total_fee NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    paid_fee NUMERIC(10, 2) DEFAULT 0.00,
    due_fee NUMERIC(10, 2) GENERATED ALWAYS AS (total_fee - discount - paid_fee) STORED,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'Enrolled' -- 'Enrolled', 'Fee Pending', 'Completed'
);

-- 7. Fee Payments Table
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(40) NOT NULL, -- 'UPI', 'Cash', 'Credit Card', 'Bank Transfer'
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_by VARCHAR(100),
    notes TEXT
);

-- =========================================================
-- Sample Seed Data
-- =========================================================

INSERT INTO courses (name, code, category, duration_weeks, fee_amount, description)
VALUES 
    ('Full Stack Web Development (MERN)', 'FSWD-101', 'Software Development', 16, 45000.00, 'Master modern full-stack web applications with React, Node.js, and MongoDB/PostgreSQL.'),
    ('Data Science & Machine Learning with Python', 'DSML-201', 'Data & AI', 20, 55000.00, 'Python, Pandas, Scikit-learn, PyTorch, and hands-on LLM engineering.'),
    ('UI/UX Design Masterclass', 'UIUX-301', 'Design', 12, 35000.00, 'Figma, wireframing, design systems, usability testing, and portfolio creation.'),
    ('Digital Marketing & Growth Hacking', 'DM-401', 'Marketing', 10, 28000.00, 'SEO, Meta & Google Ads, analytics, content strategy, and performance marketing.'),
    ('Cyber Security & Ethical Hacking', 'SEC-501', 'Cyber Security', 18, 50000.00, 'Network security, penetration testing, CEH syllabus, and vulnerability assessment.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO batches (batch_name, course_id, instructor_name, start_date, end_date, schedule_time, mode, max_capacity, current_enrolled, status)
VALUES
    ('FSWD Morning Batch (M26)', 1, 'Prof. Alex Rivera', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '120 days', 'Mon-Fri 09:00 AM - 11:30 AM', 'hybrid', 25, 19, 'upcoming'),
    ('Data Science Weekend Batch', 2, 'Dr. Sunita Sharma', CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '150 days', 'Sat-Sun 10:00 AM - 02:00 PM', 'online', 30, 24, 'upcoming'),
    ('UI/UX Evening Cohort (U4)', 3, 'Vikram Mehta', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', 'Mon-Wed-Fri 06:30 PM - 08:30 PM', 'offline', 20, 18, 'ongoing'),
    ('Cyber Security Sprint Batch', 5, 'Rohan Kapoor', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '140 days', 'Tue-Thu-Sat 03:00 PM - 05:30 PM', 'hybrid', 20, 11, 'upcoming');

INSERT INTO leads (full_name, phone, email, city, qualification, college_university, interested_course, lead_source, assigned_counsellor, lead_status, priority, next_follow_up_date, notes)
VALUES
    ('Riya Kapoor', '+91 98765 43210', 'riya.k@example.com', 'Pune', 'B.Tech CS', 'PICT Pune', 'Full Stack Web Development (MERN)', 'Website', 'Pooja Verma', 'Counselling Scheduled', 'Hot', CURRENT_DATE + INTERVAL '1 day', 'Attending Saturday counseling demo class for MERN.'),
    ('Aman Verma', '+91 98111 22334', 'aman.v@example.com', 'Mumbai', 'B.Sc Statistics', 'St. Xavier''s College', 'Data Science & Machine Learning with Python', 'Instagram', 'Pooja Verma', 'Follow-up Required', 'Hot', CURRENT_DATE, 'Interested in weekend Python batch; waiting for fee discount approval.'),
    ('Neha Deshmukh', '+91 97234 56789', 'neha.d@example.com', 'Pune', 'B.Des', 'MIT Institute of Design', 'UI/UX Design Masterclass', 'Walk-in', 'Karan Singhania', 'Interested', 'Warm', CURRENT_DATE + INTERVAL '2 days', 'Walked into campus today. Inquired about design portfolio mentorship.'),
    ('Siddharth Joshi', '+91 91234 09876', 'sid.j@example.com', 'Nagpur', 'BCA 3rd Year', 'Raisoni College', 'Cyber Security & Ethical Hacking', 'Google Ads', 'Rohit Sharma', 'Contacted', 'Warm', CURRENT_DATE + INTERVAL '3 days', 'Engineering 3rd year student exploring Ethical Hacking certification.'),
    ('Tanvi Agarwal', '+91 98334 11223', 'tanvi.a@example.com', 'Bengaluru', 'BE IS', 'BMS College', 'Cloud Computing & DevOps', 'LinkedIn', 'Karan Singhania', 'New', 'Hot', CURRENT_DATE, 'QA Engineer wanting to upskill in cloud technologies.');
