import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, isConnected } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data_store.json');

const loadStoreFromDisk = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        courses: Array.isArray(parsed.courses) ? parsed.courses : [],
        batches: Array.isArray(parsed.batches) ? parsed.batches : [],
        recentLeads: Array.isArray(parsed.recentLeads) ? parsed.recentLeads : [],
        trainers: Array.isArray(parsed.trainers) ? parsed.trainers : [],
        admissions: Array.isArray(parsed.admissions) ? parsed.admissions : [],
        students: Array.isArray(parsed.students) ? parsed.students : [],
        feeTransactions: Array.isArray(parsed.feeTransactions) ? parsed.feeTransactions : [],
        revenueTimeline: Array.isArray(parsed.revenueTimeline) ? parsed.revenueTimeline : []
      };
    }
  } catch (err) {
    console.error('Error loading data_store.json:', err);
  }
  return {
    courses: [],
    batches: [],
    recentLeads: [],
    trainers: [],
    admissions: [],
    students: [],
    feeTransactions: [],
    revenueTimeline: []
  };
};

// Persistent local data store (loaded from disk if exists)
const demoStore = loadStoreFromDisk();

const saveStoreToDisk = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(demoStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data_store.json:', err);
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store (clean state - no mock or dummy data)
const demoStore = {
  // Official standard curriculum courses (enrollments computed dynamically from actual students)
  courses: [
    {
      id: 1,
      name: 'Full Stack Web Development (MERN)',
      code: 'FSWD-101',
      category: 'Software Development',
      durationWeeks: 16,
      fee: 45000,
      activeStudents: 0,
      description: 'Comprehensive web development program covering React, Node.js, Express, PostgreSQL, and full-stack deployment.',
      modules: ['JavaScript & TypeScript Fundamentals', 'React 18 & Frontend Architecture', 'Node.js & Express REST APIs', 'PostgreSQL & Database Design', 'Final Capstone Project']
    },
    {
      id: 2,
      name: 'Data Science & Machine Learning with Python',
      code: 'DSML-201',
      category: 'Data & AI',
      durationWeeks: 20,
      fee: 55000,
      activeStudents: 0,
      description: 'Practical data science covering statistical modeling, Pandas, Scikit-Learn, and applied Machine Learning.',
      modules: ['Python for Data Analysis', 'Exploratory Data Analysis & SQL', 'Machine Learning Models', 'Deep Learning Basics', 'Applied Industry Project']
    },
    {
      id: 3,
      name: 'UI/UX Product Design Masterclass',
      code: 'UIUX-301',
      category: 'Design',
      durationWeeks: 12,
      fee: 35000,
      activeStudents: 0,
      description: 'User research, wireframing, Figma design systems, prototyping, and design portfolio creation.',
      modules: ['User Research & Wireframing', 'Figma Design Systems', 'Visual & Interactive Prototyping', 'Usability Testing', 'Portfolio Case Studies']
    },
    {
      id: 4,
      name: 'Digital Marketing & Growth Hacking',
      code: 'DM-401',
      category: 'Marketing',
      durationWeeks: 10,
      fee: 28000,
      activeStudents: 0,
      description: 'Performance marketing, Meta Ads, Google Ads, SEO, and conversion rate optimization.',
      modules: ['SEO & Organic Growth', 'Paid Ads (Google & Meta)', 'Content Marketing & Copywriting', 'Analytics & Reporting']
    },
    {
      id: 5,
      name: 'Cyber Security & Ethical Hacking',
      code: 'SEC-501',
      category: 'Cyber Security',
      durationWeeks: 18,
      fee: 50000,
      activeStudents: 0,
      description: 'Network defense, vulnerability assessments, penetration testing, and incident response.',
      modules: ['Networking & Linux Essentials', 'Reconnaissance & Footprinting', 'Penetration Testing Tools', 'Security Audits & Reports']
    },
    {
      id: 6,
      name: 'Cloud Computing & DevOps',
      code: 'CLD-601',
      category: 'Software Development',
      durationWeeks: 14,
      fee: 48000,
      activeStudents: 0,
      description: 'AWS architecture, CI/CD pipelines, Docker containerization, and Terraform.',
      modules: ['Cloud Infrastructure Basics', 'Docker Containerization', 'Kubernetes Deployment', 'CI/CD Pipelines with GitHub Actions']
    }
  ],
  batches: [],
  recentLeads: [],
  admissions: [],
  students: [], 
  feeTransactions: [],
  revenueTimeline: []
};

// Compute dynamic, real-time metrics strictly from recorded data
const getLiveStats = () => {
  const totalRevenue = demoStore.feeTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalPending = demoStore.students.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);
  const totalStudents = demoStore.students.length;
  const totalLeads = demoStore.recentLeads.length;
  const totalAdmissions = demoStore.admissions.length;
  const totalBatches = demoStore.batches.length;
  const totalCourses = demoStore.courses.length;
  const convRate = totalLeads > 0 ? `${Math.round((totalAdmissions / totalLeads) * 100)}%` : '0%';
  const collectionRate = (totalRevenue + totalPending > 0)
    ? `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
    : '100%';

  return {
    totalStudents,
    activeStudentsGrowth: totalStudents > 0 ? `+${totalStudents}` : '0%',
    newLeadsThisMonth: totalLeads,
    leadConversionRate: convRate,
    confirmedAdmissions: totalAdmissions,
    activeCourses: totalCourses,
    activeBatches: totalBatches,
    monthlyRevenue: totalRevenue,
    revenueGrowth: totalRevenue > 0 ? '+100%' : '0%',
    pendingFees: totalPending,
    attendanceAverage: '100%',
    feeCollectionRate: collectionRate
  };
};

// Health and DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'PostgreSQL',
      connected: isConnected,
      mode: isConnected ? 'PostgreSQL Live' : 'Persistent Local Storage (Disk)'
    }
  });
});

// Comprehensive Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const coursesWithEnrolled = demoStore.courses.map(c => ({
      ...c,
      activeStudents: demoStore.students.filter(s => s.course === c.name).length
    }));

    return res.json({
      success: true,
      stats: getLiveStats(),
      batches: demoStore.batches,
      courses: coursesWithEnrolled,
      recentLeads: demoStore.recentLeads,
      trainers: demoStore.trainers || [],
      admissions: demoStore.admissions,
      students: demoStore.students,
      feeTransactions: demoStore.feeTransactions,
      revenueTimeline: demoStore.revenueTimeline
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// Leads Endpoints
// ==========================================
app.get('/api/leads', (req, res) => {
  res.json({ success: true, data: demoStore.recentLeads });
});

app.post('/api/leads', async (req, res) => {
  const {
    id,
    name,
    phone,
    email,
    city,
    qualification,
    college,
    course,
    source,
    counselor,
    status,
    priority,
    nextFollowUpDate,
    notes,
    notesList,
    callHistory,
    createdAt
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Full Name and Phone Number are required' });
  }

  const leadId = id || Date.now();
  const existingIdx = demoStore.recentLeads.findIndex(l => l.id === leadId || (l.phone === phone && l.name === name));

  const newLead = {
    id: leadId,
    name,
    phone,
    email: email || '',
    city: city || '',
    qualification: qualification || '',
    college: college || '',
    course: course || '',
    source: source || 'Website',
    status: status || 'New',
    counselor: counselor || 'Admissions Desk',
    priority: priority || 'Warm',
    nextFollowUpDate: nextFollowUpDate || '',
    notes: notes || '',
    notesList: notesList || (notes ? [{
      id: Date.now(),
      text: notes,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: counselor || 'Admissions Desk'
    }] : []),
    callHistory: callHistory || [],
    createdAt: createdAt || new Date().toISOString().split('T')[0]
  };

  if (existingIdx !== -1) {
    demoStore.recentLeads[existingIdx] = { ...demoStore.recentLeads[existingIdx], ...newLead };
  } else {
    demoStore.recentLeads.unshift(newLead);
  }

  saveStoreToDisk();

  // If PostgreSQL is connected, persist to database table
  if (isConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO leads (full_name, phone, email, city, qualification, college_university, interested_course, lead_source, assigned_counsellor, lead_status, priority, next_follow_up_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [newLead.name, newLead.phone, newLead.email, newLead.city, newLead.qualification, newLead.college, newLead.course, newLead.source, newLead.counselor, newLead.status, newLead.priority, newLead.nextFollowUpDate || null, newLead.notes]
      );
    } catch (dbErr) {
      console.warn('PostgreSQL leads insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, lead: newLead });
});

app.put('/api/leads/:id', async (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const index = demoStore.recentLeads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    demoStore.recentLeads[index] = { ...demoStore.recentLeads[index], ...req.body };
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        const lead = demoStore.recentLeads[index];
        await pool.query(
          `UPDATE leads SET full_name = $1, phone = $2, email = $3, city = $4, qualification = $5, college_university = $6, interested_course = $7, lead_source = $8, assigned_counsellor = $9, lead_status = $10, priority = $11, next_follow_up_date = $12, notes = $13 WHERE id = $14 OR phone = $2`,
          [lead.name, lead.phone, lead.email, lead.city, lead.qualification, lead.college, lead.course, lead.source, lead.counselor, lead.status, lead.priority, lead.nextFollowUpDate || null, lead.notes, leadId]
        );
      } catch (dbErr) {
        console.warn('PostgreSQL lead update warning:', dbErr.message);
      }
    }

    return res.json({ success: true, lead: demoStore.recentLeads[index] });
  }
  res.status(404).json({ success: false, message: 'Lead not found' });
});

app.delete('/api/leads/:id', async (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const index = demoStore.recentLeads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    const deleted = demoStore.recentLeads.splice(index, 1)[0];
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        await pool.query('DELETE FROM leads WHERE id = $1 OR phone = $2', [leadId, deleted.phone]);
      } catch (dbErr) {
        console.warn('PostgreSQL lead delete warning:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Lead deleted successfully', lead: deleted });
  }
  res.status(404).json({ success: false, message: 'Lead not found' });
});

// Bulk Import Leads Endpoint
app.post('/api/leads/bulk', async (req, res) => {
  const { leads: incomingLeads } = req.body;
  if (!Array.isArray(incomingLeads)) {
    return res.status(400).json({ success: false, message: 'Expected an array of leads' });
  }

  const added = [];
  for (const lead of incomingLeads) {
    if (lead && lead.name && lead.phone) {
      const formatted = {
        id: lead.id || (Date.now() + Math.floor(Math.random() * 10000)),
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        city: lead.city || '',
        qualification: lead.qualification || '',
        college: lead.college || '',
        course: lead.course || '',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        priority: lead.priority || 'Warm',
        counselor: lead.counselor || 'Admissions Desk',
        nextFollowUpDate: lead.nextFollowUpDate || '',
        notes: lead.notes || '',
        notesList: lead.notesList || (lead.notes ? [{
          id: Date.now(),
          text: lead.notes,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: lead.counselor || 'Imported'
        }] : []),
        callHistory: lead.callHistory || [],
        createdAt: lead.createdAt || new Date().toISOString().split('T')[0]
      };
      demoStore.recentLeads.unshift(formatted);
      added.push(formatted);

      if (isConnected && pool) {
        try {
          await pool.query(
            `INSERT INTO leads (full_name, phone, email, city, qualification, college_university, interested_course, lead_source, assigned_counsellor, lead_status, priority, next_follow_up_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [formatted.name, formatted.phone, formatted.email, formatted.city, formatted.qualification, formatted.college, formatted.course, formatted.source, formatted.counselor, formatted.status, formatted.priority, formatted.nextFollowUpDate || null, formatted.notes]
          );
        } catch (dbErr) {
          // ignore
        }
      }
    }
  }

  saveStoreToDisk();
  res.status(201).json({ success: true, count: added.length, leads: added });
});

// Add Note to Lead Endpoint
app.post('/api/leads/:id/notes', async (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const lead = demoStore.recentLeads.find(l => l.id === leadId);
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }
  const { text, author } = req.body;
  const newNote = {
    id: Date.now(),
    text,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    author: author || lead.counselor || 'Admissions Desk'
  };
  if (!lead.notesList) lead.notesList = [];
  lead.notesList.unshift(newNote);
  saveStoreToDisk();

  if (isConnected && pool) {
    try {
      await pool.query('INSERT INTO lead_notes (lead_id, note_text, author) VALUES ($1, $2, $3)', [leadId, text, newNote.author]);
    } catch (dbErr) {
      console.warn('PostgreSQL note insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, note: newNote });
});

// Log Call for Lead Endpoint
app.post('/api/leads/:id/calls', async (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const lead = demoStore.recentLeads.find(l => l.id === leadId);
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }
  const { outcome, duration, notes, counselor, nextFollowUpDate } = req.body;
  const newCall = {
    id: Date.now(),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    outcome: outcome || 'Connected - Interested',
    duration: duration || '2m 00s',
    notes: notes || '',
    counselor: counselor || lead.counselor || 'Admissions Desk'
  };
  if (!lead.callHistory) lead.callHistory = [];
  lead.callHistory.unshift(newCall);
  if (nextFollowUpDate) {
    lead.nextFollowUpDate = nextFollowUpDate;
  }
  saveStoreToDisk();

  if (isConnected && pool) {
    try {
      await pool.query('INSERT INTO lead_call_history (lead_id, call_outcome, duration, remarks, counselor) VALUES ($1, $2, $3, $4, $5)', [leadId, newCall.outcome, newCall.duration, newCall.notes, newCall.counselor]);
    } catch (dbErr) {
      console.warn('PostgreSQL call log insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, call: newCall, nextFollowUpDate: lead.nextFollowUpDate });
});

// ==========================================
// Admissions Endpoints
// ==========================================
app.get('/api/admissions', (req, res) => {
  res.json({ success: true, data: demoStore.admissions });
});

app.post('/api/admissions', async (req, res) => {
  const {
    id,
    leadId,
    studentName,
    phone,
    email,
    guardianName,
    guardianPhone,
    address,
    course,
    batch,
    duration,
    admissionDate,
    totalCourseFee,
    discount,
    discountReason,
    admissionFeePaid,
    paymentPlan,
    counselor,
    notes,
    status
  } = req.body;

  if (!studentName || !phone || !course) {
    return res.status(400).json({ success: false, message: 'Student Name, Phone, and Course are required' });
  }

  const nextSeq = String(demoStore.admissions.length + 1).padStart(4, '0');
  const admissionNo = req.body.admissionNo || `ADM-2026-${nextSeq}`;
  const applicationNo = req.body.applicationNo || `APP-2026-${nextSeq}`;

  const numTotalFee = Number(totalCourseFee) || 0;
  const numDiscount = Number(discount) || 0;
  const numNetFee = Math.max(0, numTotalFee - numDiscount);
  const numPaid = Number(admissionFeePaid) || 0;
  const numDue = Math.max(0, numNetFee - numPaid);

  const newAdmission = {
    id: id || Date.now(),
    admissionNo,
    applicationNo,
    studentName,
    phone,
    email: email || '',
    guardianName: guardianName || '',
    guardianPhone: guardianPhone || '',
    address: address || '',
    course,
    batch: batch || 'General Cohort',
    duration: duration || '16 Weeks',
    admissionDate: admissionDate || new Date().toISOString().split('T')[0],
    totalCourseFee: numTotalFee,
    discount: numDiscount,
    discountReason: discountReason || '',
    netFee: numNetFee,
    admissionFeePaid: numPaid,
    feeDue: numDue,
    paymentPlan: paymentPlan || 'One-Time Full Payment',
    status: status || 'Admission Confirmed',
    counselor: counselor || 'Admissions Desk',
    notes: notes || 'Direct admission registration.'
  };

  const admIdx = demoStore.admissions.findIndex(a => a.id === newAdmission.id || a.admissionNo === newAdmission.admissionNo);
  if (admIdx !== -1) {
    demoStore.admissions[admIdx] = { ...demoStore.admissions[admIdx], ...newAdmission };
  } else {
    demoStore.admissions.unshift(newAdmission);
  }

  // If converted from a lead, mark lead as "Converted to Admission"
  if (leadId) {
    const lIdx = demoStore.recentLeads.findIndex(l => l.id === Number(leadId));
    if (lIdx !== -1) {
      demoStore.recentLeads[lIdx].status = 'Lead Confirmed (Admitted)';
      demoStore.recentLeads[lIdx].admissionNo = admissionNo;
    }
  }

  // Auto-create Enrolled Student Record in students directory without re-entering
  const stuSeq = String(demoStore.students.length + 1).padStart(4, '0');
  const studentId = req.body.studentId || `STU-2026-${stuSeq}`;
  const newStudent = {
    id: Date.now(),
    studentId,
    admissionNo,
    name: studentName,
    email: email || '',
    phone,
    guardian: guardianName || 'Guardian',
    guardianPhone: guardianPhone || '',
    course,
    batch: batch || 'General Cohort',
    enrollmentDate: admissionDate || new Date().toISOString().split('T')[0],
    feeTotal: numNetFee,
    feePaid: numPaid,
    feeDue: numDue,
    feeStatus: numDue === 0 ? 'Paid' : 'Partial',
    attendance: 100,
    status: 'Active'
  };

  const stuIdx = demoStore.students.findIndex(s => s.admissionNo === admissionNo || s.studentId === studentId);
  if (stuIdx !== -1) {
    demoStore.students[stuIdx] = { ...demoStore.students[stuIdx], ...newStudent };
  } else {
    demoStore.students.unshift(newStudent);
  }

  // If an admission fee was collected, generate payment receipt
  if (numPaid > 0) {
    const rcpSeq = String(demoStore.feeTransactions.length + 1).padStart(4, '0');
    const newReceipt = {
      receiptNo: `RCP-2026-${rcpSeq}`,
      studentName,
      studentId: newStudent.studentId,
      course,
      amount: numPaid,
      mode: 'Admission Registration (UPI / Bank)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      collectedBy: counselor || 'Admissions Desk',
      status: 'Success'
    };
    demoStore.feeTransactions.unshift(newReceipt);
  }

  saveStoreToDisk();

  // If PostgreSQL is connected, write to DB tables
  if (isConnected && pool) {
    try {
      const nameParts = studentName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const stuRes = await pool.query(
        `INSERT INTO students (student_id_code, first_name, last_name, email, phone, guardian_name, guardian_phone, address, enrollment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (student_id_code) DO UPDATE SET first_name = $2, last_name = $3, email = $4, phone = $5, guardian_name = $6, guardian_phone = $7, address = $8
         RETURNING id`,
        [newStudent.studentId, firstName, lastName, email, phone, guardianName, guardianPhone, address, 'Active']
      );

      const dbStudentId = stuRes.rows[0]?.id;
      if (dbStudentId) {
        await pool.query(
          `INSERT INTO enrollments (student_id, total_fee, discount, paid_fee, enrollment_date, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [dbStudentId, numTotalFee, numDiscount, numPaid, newAdmission.admissionDate, numDue === 0 ? 'Enrolled' : 'Fee Pending']
        );
      }
    } catch (dbErr) {
      console.warn('PostgreSQL admissions insert warning:', dbErr.message);
    }
  }

  res.status(201).json({
    success: true,
    admission: newAdmission,
    student: newStudent,
    message: 'Admission confirmed and student enrolled successfully'
  });
});

app.put('/api/admissions/:id', (req, res) => {
  const admId = parseInt(req.params.id, 10);
  const index = demoStore.admissions.findIndex(a => a.id === admId);
  if (index !== -1) {
    demoStore.admissions[index] = { ...demoStore.admissions[index], ...req.body };
    saveStoreToDisk();
    return res.json({ success: true, admission: demoStore.admissions[index] });
  }
  res.status(404).json({ success: false, message: 'Admission record not found' });
});

// ==========================================
// Students Endpoints
// ==========================================
app.get('/api/students', async (req, res) => {
  if (isConnected && pool) {
    try {
      const result = await pool.query(`
        SELECT
          s.id,
          s.student_id_code AS "studentId",
          CONCAT_WS(' ', s.first_name, s.last_name) AS name,
          s.email,
          s.phone,
          s.guardian_name AS guardian,
          s.guardian_phone AS "guardianPhone",
          s.address,
          s.date_of_birth AS "dateOfBirth",
          s.enrollment_status AS status,
          COALESCE(
            json_agg(
              json_build_object(
                'course', c.name,
                'batch', b.batch_name,
                'feeTotal', e.total_fee,
                'feePaid', e.paid_fee,
                'feeDue', e.due_fee,
                'enrollmentDate', e.enrollment_date,
                'status', e.status
              )
              ORDER BY e.enrollment_date DESC
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) AS enrollments,
          COALESCE(SUM(e.total_fee), 0) AS "feeTotal",
          COALESCE(SUM(e.paid_fee), 0) AS "feePaid",
          COALESCE(SUM(e.due_fee), 0) AS "feeDue"
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN batches b ON e.batch_id = b.id
        GROUP BY s.id
        ORDER BY s.id DESC
      `);

      if (result.rows.length > 0) {
        const students = result.rows.map(student => ({
          ...student,
          feeStatus:
            Number(student.feeTotal) === 0
              ? 'Not Enrolled'
              : Number(student.feeDue) === 0
                ? 'Paid'
                : Number(student.feePaid) > 0
                  ? 'Partial'
                  : 'Overdue',
          course: student.enrollments[0]?.course || '',
          batch: student.enrollments[0]?.batch || ''
        }));

        return res.status(200).json({
          success: true,
          count: students.length,
          data: students
        });
      }
    } catch (error) {
      console.warn('PostgreSQL query error, falling back to demoStore:', error.message);
    }
  }

  res.json({ success: true, count: demoStore.students.length, data: demoStore.students });
});

// ==========================================
// Courses Endpoints
// ==========================================
app.get('/api/courses', async (req, res) => {
  if (isConnected && pool) {
    try {
      const result = await pool.query('SELECT * FROM courses ORDER BY id ASC');
      if (result.rows.length > 0) {
        const dbCourses = result.rows.map(r => ({
          id: r.id,
          name: r.name,
          code: r.code,
          category: r.category,
          durationWeeks: Number(r.duration_weeks),
          fee: Number(r.fee_amount),
          description: r.description || '',
          activeStudents: demoStore.students.filter(s => s.course === r.name).length
        }));
        return res.json({ success: true, data: dbCourses });
      }
    } catch (err) {
      console.warn('PostgreSQL fetch courses warning:', err.message);
    }
  }
  res.json({ success: true, data: demoStore.courses });
});

app.post('/api/courses', async (req, res) => {
  const { id, name, code, category, durationWeeks, fee, description, modules, trainerId, trainerName } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Course name is required' });
  }

  const courseId = id || Date.now();
  const courseCode = code || `CRS-${Date.now().toString().slice(-4)}`;

  const newCourse = {
    id: courseId,
    name,
    code: courseCode,
    category: category || 'Software Development',
    trainerId: trainerId || '',
    trainerName: trainerName || 'Unassigned',
    durationWeeks: Number(durationWeeks) || 12,
    fee: Number(fee) || 0,
    activeStudents: 0,
    description: description || '',
    modules: Array.isArray(modules) ? modules : []
  };

  const existingIdx = demoStore.courses.findIndex(c => c.id === courseId || c.code === courseCode);
  if (existingIdx !== -1) {
    demoStore.courses[existingIdx] = { ...demoStore.courses[existingIdx], ...newCourse };
  } else {
    demoStore.courses.unshift(newCourse);
  }

  saveStoreToDisk();

  if (isConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO courses (name, code, category, duration_weeks, fee_amount, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO UPDATE SET name = $1, category = $3, duration_weeks = $4, fee_amount = $5, description = $6`,
        [newCourse.name, newCourse.code, newCourse.category, newCourse.durationWeeks, newCourse.fee, newCourse.description]
      );
    } catch (dbErr) {
      console.warn('PostgreSQL course insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, course: newCourse });
});

app.put('/api/courses/:id', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  const index = demoStore.courses.findIndex(c => c.id === courseId);
  if (index !== -1) {
    demoStore.courses[index] = { ...demoStore.courses[index], ...req.body };
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        const c = demoStore.courses[index];
        await pool.query(
          `UPDATE courses SET name = $1, category = $2, duration_weeks = $3, fee_amount = $4, description = $5 WHERE id = $6 OR code = $7`,
          [c.name, c.category, c.durationWeeks, c.fee, c.description, courseId, c.code]
        );
      } catch (dbErr) {
        console.warn('PostgreSQL course update warning:', dbErr.message);
      }
    }

    return res.json({ success: true, course: demoStore.courses[index] });
  }
  res.status(404).json({ success: false, message: 'Course not found' });
});

app.delete('/api/courses/:id', async (req, res) => {
  const courseId = parseInt(req.params.id, 10);
  const index = demoStore.courses.findIndex(c => c.id === courseId);
  if (index !== -1) {
    const deleted = demoStore.courses.splice(index, 1)[0];
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        await pool.query('DELETE FROM courses WHERE id = $1 OR code = $2', [courseId, deleted.code]);
      } catch (dbErr) {
        console.warn('PostgreSQL course delete warning:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Course deleted successfully', course: deleted });
  }
  res.status(404).json({ success: false, message: 'Course not found' });
});

// ==========================================
// Batches Endpoints
// ==========================================
app.get('/api/batches', async (req, res) => {
  if (isConnected && pool) {
    try {
      const result = await pool.query('SELECT * FROM batches ORDER BY id ASC');
      if (result.rows.length > 0) {
        const dbBatches = result.rows.map(r => ({
          id: r.id,
          name: r.batch_name,
          instructor: r.instructor_name,
          startDate: r.start_date,
          timing: r.schedule_time,
          mode: r.mode,
          capacity: r.max_capacity,
          enrolled: r.current_enrolled,
          status: r.status
        }));
        return res.json({ success: true, data: dbBatches });
      }
    } catch (err) {
      console.warn('PostgreSQL fetch batches warning:', err.message);
    }
  }
  res.json({ success: true, data: demoStore.batches });
});

app.post('/api/batches', async (req, res) => {
  const { id, name, course, instructor, timing, startDate, capacity, mode, room } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Batch name is required' });
  }

  const batchId = id || Date.now();
  const newBatch = {
    id: batchId,
    name,
    course: course || 'General Course',
    instructor: instructor || 'Staff Instructor',
    timing: timing || 'Morning',
    startDate: startDate || new Date().toISOString().split('T')[0],
    enrolled: 0,
    capacity: Number(capacity) || 25,
    mode: mode || 'Classroom',
    room: room || 'Room 1',
    status: 'Upcoming'
  };

  const existingIdx = demoStore.batches.findIndex(b => b.id === batchId || b.name === name);
  if (existingIdx !== -1) {
    demoStore.batches[existingIdx] = { ...demoStore.batches[existingIdx], ...newBatch };
  } else {
    demoStore.batches.unshift(newBatch);
  }

  saveStoreToDisk();

  if (isConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO batches (batch_name, instructor_name, start_date, schedule_time, mode, max_capacity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newBatch.name, newBatch.instructor, newBatch.startDate, newBatch.timing, newBatch.mode, newBatch.capacity, newBatch.status]
      );
    } catch (dbErr) {
      console.warn('PostgreSQL batch insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, batch: newBatch });
});

app.put('/api/batches/:id', async (req, res) => {
  const batchId = parseInt(req.params.id, 10);
  const index = demoStore.batches.findIndex(b => b.id === batchId);
  if (index !== -1) {
    demoStore.batches[index] = { ...demoStore.batches[index], ...req.body };
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        const b = demoStore.batches[index];
        await pool.query(
          `UPDATE batches SET batch_name = $1, instructor_name = $2, schedule_time = $3, mode = $4, max_capacity = $5, status = $6 WHERE id = $7`,
          [b.name, b.instructor, b.timing, b.mode, b.capacity, b.status, batchId]
        );
      } catch (dbErr) {
        console.warn('PostgreSQL batch update warning:', dbErr.message);
      }
    }

    return res.json({ success: true, batch: demoStore.batches[index] });
  }
  res.status(404).json({ success: false, message: 'Batch not found' });
});

app.delete('/api/batches/:id', async (req, res) => {
  const batchId = parseInt(req.params.id, 10);
  const index = demoStore.batches.findIndex(b => b.id === batchId);
  if (index !== -1) {
    const deleted = demoStore.batches.splice(index, 1)[0];
    saveStoreToDisk();

    if (isConnected && pool) {
      try {
        await pool.query('DELETE FROM batches WHERE id = $1', [batchId]);
      } catch (dbErr) {
        console.warn('PostgreSQL batch delete warning:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Batch deleted successfully', batch: deleted });
  }
  res.status(404).json({ success: false, message: 'Batch not found' });
});

// ==========================================
// Fees Endpoints
// ==========================================
app.get('/api/fees', (req, res) => {
  res.json({ success: true, data: demoStore.feeTransactions });
});

app.post('/api/fees', async (req, res) => {
  const { studentName, studentId, course, amount, mode } = req.body;
  const numAmount = Number(amount) || 0;
  const rcpSeq = String(demoStore.feeTransactions.length + 1).padStart(4, '0');

  const newReceipt = {
    receiptNo: req.body.receiptNo || `RCP-2026-${rcpSeq}`,
    studentName,
    studentId: studentId || 'STU-GEN',
    course: course || 'Tuition Fee',
    amount: numAmount,
    mode: mode || 'UPI',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    collectedBy: 'Finance Desk',
    status: 'Success'
  };

  demoStore.feeTransactions.unshift(newReceipt);

  // Update student fee balance in demoStore
  const student = demoStore.students.find(s => s.studentId === studentId || s.name.toLowerCase() === studentName?.toLowerCase());
  if (student) {
    student.feePaid = Number(student.feePaid || 0) + numAmount;
    student.feeDue = Math.max(0, Number(student.feeTotal || 0) - student.feePaid);
    student.feeStatus = student.feeDue === 0 ? 'Paid' : 'Partial';
  }

  saveStoreToDisk();

  if (isConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO fee_payments (receipt_no, amount, payment_mode, received_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (receipt_no) DO NOTHING`,
        [newReceipt.receiptNo, newReceipt.amount, newReceipt.mode, newReceipt.collectedBy]
      );
    } catch (dbErr) {
      console.warn('PostgreSQL fees insert warning:', dbErr.message);
    }
  }

  res.status(201).json({ success: true, receipt: newReceipt });
});

// ==========================================
// Trainers / Employees Endpoints
// ==========================================
app.get('/api/trainers', (req, res) => {
  res.json({ success: true, data: demoStore.trainers || [] });
});

app.post('/api/trainers', (req, res) => {
  const {
    employeeId,
    name,
    role,
    department,
    phone,
    email,
    qualification,
    experience,
    status,
    bio,
    skills,
    assignedCourses,
    assignedBatches,
    schedule
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Trainer Name and Phone Number are required' });
  }

  const nextSeq = String((demoStore.trainers?.length || 0) + 1).padStart(3, '0');
  const newTrainer = {
    id: req.body.id || Date.now(),
    employeeId: employeeId || `EMP-2026-${nextSeq}`,
    name,
    role: role || 'Technical Trainer',
    department: department || 'Academic Faculty',
    phone,
    email: email || '',
    qualification: qualification || '',
    experience: experience || '1+ Years',
    status: status || 'Active',
    bio: bio || '',
    skills: Array.isArray(skills) ? skills : [],
    assignedCourses: Array.isArray(assignedCourses) ? assignedCourses : [],
    assignedBatches: Array.isArray(assignedBatches) ? assignedBatches : [],
    schedule: Array.isArray(schedule) ? schedule : [],
    joiningDate: req.body.joiningDate || new Date().toISOString().split('T')[0]
  };

  if (!demoStore.trainers) demoStore.trainers = [];
  demoStore.trainers.unshift(newTrainer);
  saveStoreToDisk();
  res.status(201).json({ success: true, trainer: newTrainer });
});

app.put('/api/trainers/:id', (req, res) => {
  const trainerId = parseInt(req.params.id, 10);
  if (!demoStore.trainers) demoStore.trainers = [];
  const index = demoStore.trainers.findIndex(t => t.id === trainerId);
  if (index !== -1) {
    demoStore.trainers[index] = { ...demoStore.trainers[index], ...req.body };
    saveStoreToDisk();
    return res.json({ success: true, trainer: demoStore.trainers[index] });
  }
  res.status(404).json({ success: false, message: 'Trainer record not found' });
});

app.delete('/api/trainers/:id', (req, res) => {
  const trainerId = parseInt(req.params.id, 10);
  if (!demoStore.trainers) demoStore.trainers = [];
  const index = demoStore.trainers.findIndex(t => t.id === trainerId);
  if (index !== -1) {
    const deleted = demoStore.trainers.splice(index, 1)[0];
    saveStoreToDisk();
    return res.json({ success: true, message: 'Trainer deleted successfully', trainer: deleted });
  }
  res.status(404).json({ success: false, message: 'Trainer not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Institute CRM Backend Server running at http://localhost:${PORT}`);
});
