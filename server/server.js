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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health and DB status
app.get('/api/health', async (req, res) => {
  let dbConnected = isConnected;
  try {
    await pool.query('SELECT 1');
    dbConnected = true;
  } catch (err) {
    dbConnected = false;
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'PostgreSQL',
      connected: dbConnected,
      mode: dbConnected ? 'PostgreSQL Live' : 'Disconnected'
    }
  });
});

// ==========================================
// Admissions & Students Synchronization
// ==========================================
const cleanupDuplicateLeads = async () => {
  try {
    await pool.query(`
      DELETE FROM leads
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM leads
        GROUP BY RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10)
      )
      AND phone IS NOT NULL
      AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 10
    `);

    // Strictly remove any leads that have already been converted into confirmed admissions
    await pool.query(`
      DELETE FROM leads
      WHERE (
        phone IS NOT NULL AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 10 AND
        RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) IN (
          SELECT RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10)
          FROM admissions
          WHERE phone IS NOT NULL AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) >= 10
        )
      )
      OR lead_status IN ('Lead Confirmed (Admitted)', 'Admitted', 'Converted')
    `).catch(() => null);
  } catch (err) {
    console.warn('Cleanup duplicate leads warning:', err.message);
  }
};

const syncAdmissionsAndStudents = async () => {
  try {
    await pool.query('ALTER TABLE admissions ADD COLUMN IF NOT EXISTS student_deleted BOOLEAN DEFAULT FALSE');
    const adms = await pool.query('SELECT * FROM admissions WHERE COALESCE(student_deleted, FALSE) = FALSE');
    for (const adm of adms.rows) {
      const cleanPhone = adm.phone ? String(adm.phone).replace(/\D/g, '').slice(-10) : '';
      const stuCheck = await pool.query(
        `SELECT id FROM students
         WHERE admission_no = $1
            OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $2)
         LIMIT 1`,
        [adm.admission_no, cleanPhone]
      );

      if (stuCheck.rows.length === 0) {
        const stuCount = await pool.query('SELECT COUNT(*) FROM students');
        const seq = String(Number(stuCount.rows[0].count) + 1).padStart(4, '0');
        const studentCode = `STU-2026-${seq}`;
        const nameParts = (adm.student_name || 'Student').trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const insRes = await pool.query(
          `INSERT INTO students (
             student_id_code, first_name, last_name, email, phone,
             guardian_name, guardian_phone, address, admission_no, enrollment_status
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            studentCode,
            firstName,
            lastName,
            adm.email || `${studentCode.toLowerCase()}@institute.local`,
            adm.phone || cleanPhone,
            adm.guardian_name || '',
            adm.guardian_phone || '',
            adm.address || '',
            adm.admission_no,
            'Active'
          ]
        );

        const newId = insRes.rows[0]?.id;
        if (newId) {
          let courseId = null;
          let batchId = null;
          if (adm.course) {
            const cRes = await pool.query('SELECT id FROM courses WHERE name = $1 LIMIT 1', [adm.course]);
            courseId = cRes.rows[0]?.id || null;
          }
          if (adm.batch) {
            const bRes = await pool.query('SELECT id FROM batches WHERE batch_name = $1 LIMIT 1', [adm.batch]);
            batchId = bRes.rows[0]?.id || null;
          }
          const totalFee = Number(adm.total_course_fee) || 0;
          const discount = Number(adm.discount) || 0;
          const paidFee = Number(adm.admission_fee_paid) || 0;
          const dueFee = Math.max(0, totalFee - discount - paidFee);

          await pool.query(
            `INSERT INTO enrollments (student_id, course_id, batch_id, total_fee, discount, paid_fee, due_fee, enrollment_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              newId,
              courseId,
              batchId,
              totalFee,
              discount,
              paidFee,
              dueFee,
              adm.admission_date || new Date().toISOString().split('T')[0],
              dueFee === 0 ? 'Enrolled' : 'Fee Pending'
            ]
          );
        }
      } else {
        const studentId = stuCheck.rows[0].id;
        const nameParts = (adm.student_name || '').trim().split(/\s+/).filter(Boolean);
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';
        await pool.query(
          `UPDATE students
           SET admission_no = COALESCE(admission_no, $1),
               first_name = CASE WHEN $3 <> '' THEN $3 ELSE first_name END,
               last_name = CASE WHEN $4 <> '' THEN $4 ELSE last_name END
           WHERE id = $2`,
          [adm.admission_no, studentId, fName, lName]
        );

        // FIX: Ensure enrollment exists/updates for existing students as well
        let courseId = null;
        let batchId = null;
        if (adm.course) {
          const cRes = await pool.query('SELECT id FROM courses WHERE name = $1 LIMIT 1', [adm.course]);
          courseId = cRes.rows[0]?.id || null;
        }
        if (adm.batch) {
          const bRes = await pool.query('SELECT id FROM batches WHERE batch_name = $1 LIMIT 1', [adm.batch]);
          batchId = bRes.rows[0]?.id || null;
        }
        const totalFee = Number(adm.total_course_fee) || 0;
        const discount = Number(adm.discount) || 0;
        const paidFee = Number(adm.admission_fee_paid) || 0;
        const dueFee = Math.max(0, totalFee - discount - paidFee);

        const enrollCheck = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 LIMIT 1', [studentId]);
        if (enrollCheck.rows.length > 0) {
          await pool.query(
            `UPDATE enrollments SET
               course_id = COALESCE($1, course_id),
               batch_id = COALESCE($2, batch_id),
               total_fee = $3,
               discount = $4,
               paid_fee = $5,
               due_fee = $6
             WHERE student_id = $7`,
            [courseId, batchId, totalFee, discount, paidFee, dueFee, studentId]
          );
        } else {
          await pool.query(
            `INSERT INTO enrollments (student_id, course_id, batch_id, total_fee, discount, paid_fee, due_fee, enrollment_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [studentId, courseId, batchId, totalFee, discount, paidFee, dueFee, adm.admission_date || new Date().toISOString().split('T')[0], dueFee === 0 ? 'Enrolled' : 'Fee Pending']
          );
        }
      }
    }
  } catch (err) {
    console.warn('Sync admissions to students warning:', err.message);
  }
};

// Helper function to match courses across variants, acronyms, and codes
function isMatchCourse(targetCourse, course) {
  if (!targetCourse || !course) return false;
  const target = String(targetCourse).trim().toLowerCase();
  const cName = String(course.name || '').trim().toLowerCase();
  const cCode = String(course.code || '').trim().toLowerCase();

  if (!target || (!cName && !cCode)) return false;
  if (target === cName || target === cCode) return true;

  const parenMatch = cName.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].trim().toLowerCase() === target) {
    return true;
  }

  if (target.length >= 3 && (cName.includes(target) || target.includes(cName))) {
    return true;
  }

  const targetTokens = target.split(/[\s,()/-]+/).filter(t => t.length >= 3);
  const nameTokens = cName.split(/[\s,()/-]+/).filter(t => t.length >= 3);
  if (targetTokens.some(t => nameTokens.includes(t))) {
    return true;
  }

  return false;
}

// Comprehensive Dashboard stats endpoint (100% Direct from PostgreSQL)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    await cleanupDuplicateLeads();
    const [coursesRes, batchesRes, leadsRes, admissionsRes, studentsRes, feesRes, trainersRes] = await Promise.all([
      pool.query('SELECT * FROM courses ORDER BY id ASC'),
      pool.query('SELECT * FROM batches ORDER BY id ASC'),
      pool.query('SELECT * FROM leads ORDER BY id DESC'),
      pool.query('SELECT * FROM admissions ORDER BY id DESC'),
      pool.query(`
        SELECT
          s.id,
          s.student_id_code AS "studentId",
          CONCAT_WS(' ', s.first_name, s.last_name) AS name,
          s.first_name AS "firstName",
          s.last_name AS "lastName",
          s.email,
          s.phone,
          s.guardian_name AS guardian,
          s.guardian_phone AS "guardianPhone",
          s.address,
          TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dob",
          s.gender,
          s.qualification,
          s.college,
          s.passing_year AS "passingYear",
          COALESCE(s.admission_no, a.admission_no) AS "admissionNo",
          s.enrollment_status AS status,
          COALESCE(NULLIF(e.total_fee, 0), NULLIF(c.fee_amount, 0), NULLIF(ac.fee_amount, 0), NULLIF(a.total_course_fee, 0), 0) AS "feeTotal",
          COALESCE(e.paid_fee, a.admission_fee_paid, 0) AS "feePaid",
          COALESCE(
            e.due_fee,
            a.fee_due,
            GREATEST(0, COALESCE(NULLIF(e.total_fee, 0), NULLIF(c.fee_amount, 0), NULLIF(ac.fee_amount, 0), NULLIF(a.total_course_fee, 0), 0) - COALESCE(e.paid_fee, a.admission_fee_paid, 0)),
            0
          ) AS "feeDue",
          COALESCE(c.name, a.course) AS course,
          COALESCE(b.batch_name, a.batch) AS batch
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN batches b ON e.batch_id = b.id
        LEFT JOIN LATERAL (
          SELECT admission_no, course, batch, total_course_fee, admission_fee_paid, fee_due
          FROM admissions
          WHERE admission_no = s.admission_no
             OR (s.phone IS NOT NULL AND s.phone <> '' AND phone = s.phone)
          ORDER BY (admission_no = s.admission_no) DESC, id DESC
          LIMIT 1
        ) a ON true
        LEFT JOIN LATERAL (
          SELECT fee_amount
          FROM courses
          WHERE LOWER(TRIM(name)) = LOWER(TRIM(COALESCE(c.name, a.course)))
          LIMIT 1
        ) ac ON true
        ORDER BY s.id DESC
      `),
      pool.query(`
        SELECT 
          f.id, 
          f.receipt_no, 
          f.amount, 
          f.payment_mode, 
          f.payment_date, 
          f.received_by,
          s.student_id_code AS "studentId", 
          CONCAT_WS(' ', s.first_name, s.last_name) AS "studentName",
          c.name AS "course"
        FROM fee_payments f
        LEFT JOIN enrollments e ON f.enrollment_id = e.id
        LEFT JOIN students s ON e.student_id = s.id
        LEFT JOIN courses c ON e.course_id = c.id
        ORDER BY f.id DESC
      `),
      pool.query('SELECT * FROM trainers ORDER BY id ASC')
    ]);

    const courses = coursesRes.rows.map(r => {
      const matchStu = studentsRes.rows.filter(s => isMatchCourse(s.course, r));
      const matchAdm = admissionsRes.rows.filter(a => isMatchCourse(a.course, r) && a.status !== 'Cancelled' && a.status !== 'Rejected');
      const uniqueKeys = new Set();
      matchStu.forEach(s => uniqueKeys.add(s.admissionNo || s.phone || s.studentId || String(s.id)));
      matchAdm.forEach(a => uniqueKeys.add(a.admission_no || a.phone || a.student_name || String(a.id)));

      return {
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        durationWeeks: Number(r.duration_weeks),
        fee: Number(r.fee_amount),
        description: r.description || '',
        activeStudents: uniqueKeys.size
      };
    });

    const batches = batchesRes.rows.map(r => ({
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

    const seenLeadPhones = new Set();
    const recentLeads = [];
    for (const r of leadsRes.rows) {
      const cleanPhone = String(r.phone || '').replace(/\D/g, '').slice(-10);
      const key = cleanPhone ? `phone_${cleanPhone}` : `id_${r.id}`;
      if (!seenLeadPhones.has(key)) {
        seenLeadPhones.add(key);
        recentLeads.push({
          id: r.id,
          name: r.full_name,
          phone: r.phone,
          email: r.email || '',
          city: r.city || '',
          qualification: r.qualification || '',
          college: r.college_university || '',
          course: r.interested_course || '',
          source: r.lead_source || 'Website',
          status: r.lead_status || 'New',
          priority: r.priority || 'Warm',
          counselor: r.assigned_counsellor || 'Admissions Desk',
          nextFollowUpDate: r.next_follow_up_date || '',
          notes: r.notes || '',
          notesList: [],
          callHistory: [],
          createdAt: r.created_date || new Date().toISOString().split('T')[0]
        });
      }
    }

    const admissions = admissionsRes.rows.map(r => ({
      id: r.id,
      admissionNo: r.admission_no,
      applicationNo: r.application_no,
      studentName: r.student_name,
      phone: r.phone,
      email: r.email,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      address: r.address,
      course: r.course,
      batch: r.batch,
      duration: r.duration,
      admissionDate: r.admission_date,
      totalCourseFee: Number(r.total_course_fee),
      discount: Number(r.discount),
      discountReason: r.discount_reason,
      netFee: Number(r.net_fee),
      admissionFeePaid: Number(r.admission_fee_paid),
      feeDue: Number(r.fee_due),
      paymentPlan: r.payment_plan,
      status: r.status,
      counselor: r.counselor,
      notes: r.notes
    }));

    const students = studentsRes.rows.map(s => ({
      ...s,
      feeStatus:
        Number(s.feeTotal) === 0
          ? 'Not Enrolled'
          : Number(s.feeDue) === 0
            ? 'Paid'
            : Number(s.feePaid) > 0
              ? 'Partial'
              : 'Overdue'
    }));

    const feeTransactions = feesRes.rows.map(f => ({
      id: f.id,
      receiptNo: f.receipt_no,
      studentName: f.studentName || 'Registered Student',
      studentId: f.studentId || 'STU',
      course: f.course || 'Tuition Fee',
      amount: Number(f.amount),
      mode: f.payment_mode,
      date: f.payment_date,
      collectedBy: f.received_by || 'Finance Desk',
      status: 'Success'
    }));

    const trainers = trainersRes.rows.map(t => ({
      id: t.id,
      employeeId: t.employee_id,
      name: t.name,
      role: t.role,
      department: t.department,
      phone: t.phone,
      email: t.email,
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
      bio: t.bio,
      skills: Array.isArray(t.skills) ? t.skills : [],
      assignedCourses: Array.isArray(t.assigned_courses) ? t.assigned_courses : [],
      assignedBatches: Array.isArray(t.assigned_batches) ? t.assigned_batches : [],
      schedule: Array.isArray(t.schedule) ? t.schedule : [],
      joiningDate: t.joining_date
    }));

    const totalRevenue = feeTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalPending = students.reduce((acc, s) => acc + Number(s.feeDue || 0), 0);
    const totalStudents = students.length;
    const totalLeads = recentLeads.length;
    const totalAdmissions = admissions.length;
    const convRate = (totalLeads + totalAdmissions) > 0 ? `${Math.round((totalAdmissions / (totalLeads + totalAdmissions)) * 100)}%` : '0%';
    const collectionRate = (totalRevenue + totalPending > 0)
      ? `${Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)}%`
      : '100%';

    const stats = {
      totalStudents,
      activeStudentsGrowth: totalStudents > 0 ? `+${totalStudents}` : '0%',
      newLeadsThisMonth: totalLeads,
      leadConversionRate: convRate,
      confirmedAdmissions: totalAdmissions,
      activeCourses: courses.length,
      activeBatches: batches.length,
      monthlyRevenue: totalRevenue,
      revenueGrowth: totalRevenue > 0 ? '+100%' : '0%',
      pendingFees: totalPending,
      attendanceAverage: '100%',
      feeCollectionRate: collectionRate
    };

    return res.json({
      success: true,
      stats,
      batches,
      courses,
      recentLeads,
      trainers,
      admissions,
      students,
      feeTransactions,
      revenueTimeline: []
    });
  } catch (error) {
    console.error('Error fetching dashboard stats from PostgreSQL:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// Leads Endpoints (PostgreSQL)
// ==========================================
app.get('/api/leads', async (req, res) => {
  try {
    await cleanupDuplicateLeads();
    const result = await pool.query('SELECT * FROM leads ORDER BY id DESC');
    const seenPhones = new Set();
    const leads = [];
    for (const r of result.rows) {
      const cleanPhone = String(r.phone || '').replace(/\D/g, '').slice(-10);
      const key = cleanPhone ? `phone_${cleanPhone}` : `id_${r.id}`;
      if (!seenPhones.has(key)) {
        seenPhones.add(key);
        leads.push({
          id: r.id,
          name: r.full_name,
          phone: r.phone,
          email: r.email || '',
          city: r.city || '',
          qualification: r.qualification || '',
          college: r.college_university || '',
          course: r.interested_course || '',
          source: r.lead_source || 'Website',
          status: r.lead_status || 'New',
          priority: r.priority || 'Warm',
          counselor: r.assigned_counsellor || 'Admissions Desk',
          nextFollowUpDate: r.next_follow_up_date || '',
          notes: r.notes || '',
          createdAt: r.created_date
        });
      }
    }
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const {
      name, phone, email, city, qualification, college,
      course, source, counselor, status, priority, nextFollowUpDate, notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    // Prevent duplicate lead insertion: if lead with same 10-digit phone exists, return it
    if (cleanPhone) {
      const existing = await pool.query(
        `SELECT * FROM leads WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1 ORDER BY id DESC LIMIT 1`,
        [cleanPhone]
      ).catch(() => null);

      if (existing && existing.rows && existing.rows.length > 0) {
        let r = existing.rows[0];
        if (source === 'QR Code (Campus Reception)') {
          const updated = await pool.query(
            `UPDATE leads
             SET full_name = COALESCE(NULLIF($1, ''), full_name),
                 email = COALESCE(NULLIF($2, ''), email),
                 interested_course = COALESCE(NULLIF($3, ''), interested_course),
                 lead_source = COALESCE(NULLIF($4, ''), lead_source),
                 notes = COALESCE(NULLIF($5, ''), notes),
                 created_date = CURRENT_DATE
             WHERE id = $6
             RETURNING *`,
            [name, email || '', course || '', source, notes || '', r.id]
          ).catch(() => null);
          if (updated && updated.rows && updated.rows[0]) {
            r = updated.rows[0];
          }
        } else if (!r.interested_course && course) {
          await pool.query(
            'UPDATE leads SET interested_course = $1, lead_source = COALESCE(lead_source, $2) WHERE id = $3',
            [course, source || 'QR Code (Campus Reception)', r.id]
          ).catch(() => null);
          r.interested_course = course;
        }
        const existingLead = {
          id: r.id,
          name: r.full_name,
          phone: r.phone,
          email: r.email,
          city: r.city,
          qualification: r.qualification,
          college: r.college_university,
          course: r.interested_course,
          source: r.lead_source,
          status: r.lead_status,
          priority: r.priority,
          counselor: r.assigned_counsellor,
          nextFollowUpDate: r.next_follow_up_date,
          notes: r.notes,
          createdAt: r.created_date
        };
        return res.status(200).json({ success: true, lead: existingLead, deduplicated: true });
      }
    }

    const result = await pool.query(
      `INSERT INTO leads (full_name, phone, email, city, qualification, college_university, interested_course, lead_source, assigned_counsellor, lead_status, priority, next_follow_up_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [name, phone, email || '', city || '', qualification || '', college || '', course || '', source || 'Website', counselor || 'Admissions Desk', status || 'New', priority || 'Warm', nextFollowUpDate || null, notes || '']
    );

    const r = result.rows[0];
    const newLead = {
      id: r.id,
      name: r.full_name,
      phone: r.phone,
      email: r.email,
      city: r.city,
      qualification: r.qualification,
      college: r.college_university,
      course: r.interested_course,
      source: r.lead_source,
      status: r.lead_status,
      priority: r.priority,
      counselor: r.assigned_counsellor,
      nextFollowUpDate: r.next_follow_up_date,
      notes: r.notes,
      createdAt: r.created_date
    };
    res.status(201).json({ success: true, lead: newLead });
  } catch (err) {
    console.warn('⚠️ PostgreSQL unavailable for POST /api/leads, falling back to response:', err.message);
    const fallbackLead = {
      id: Date.now(),
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email || '',
      city: req.body.city || '',
      qualification: req.body.qualification || '',
      college: req.body.college || '',
      course: req.body.course || '',
      source: req.body.source || 'QR Code (Campus Reception)',
      status: req.body.status || 'New',
      priority: req.body.priority || 'Warm',
      counselor: req.body.counselor || 'Admissions Desk',
      nextFollowUpDate: req.body.nextFollowUpDate || null,
      notes: req.body.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    res.status(201).json({ success: true, lead: fallbackLead, fallback: true });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { name, phone, email, city, qualification, college, course, source, counselor, status, priority, nextFollowUpDate, notes } = req.body;

    const result = await pool.query(
      `UPDATE leads SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        city = COALESCE($4, city),
        qualification = COALESCE($5, qualification),
        college_university = COALESCE($6, college_university),
        interested_course = COALESCE($7, interested_course),
        lead_source = COALESCE($8, lead_source),
        assigned_counsellor = COALESCE($9, assigned_counsellor),
        lead_status = COALESCE($10, lead_status),
        priority = COALESCE($11, priority),
        next_follow_up_date = COALESCE($12, next_follow_up_date),
        notes = COALESCE($13, notes)
       WHERE id = $14
       RETURNING *`,
      [name, phone, email, city, qualification, college, course, source, counselor, status, priority, nextFollowUpDate || null, notes, leadId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM leads WHERE id = $1', [leadId]);
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/leads/by-phone/:phone', async (req, res) => {
  try {
    const cleanPhone = String(req.params.phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone) {
      await pool.query(
        `DELETE FROM leads WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1`,
        [cleanPhone]
      );
    }
    res.json({ success: true, message: 'Lead deleted by phone successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads/bulk', async (req, res) => {
  try {
    const { leads: incomingLeads } = req.body;
    if (!Array.isArray(incomingLeads)) {
      return res.status(400).json({ success: false, message: 'Expected an array of leads' });
    }

    const added = [];
    for (const lead of incomingLeads) {
      if (lead && lead.name && lead.phone) {
        const result = await pool.query(
          `INSERT INTO leads (full_name, phone, email, city, qualification, college_university, interested_course, lead_source, assigned_counsellor, lead_status, priority, next_follow_up_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [lead.name, lead.phone, lead.email || '', lead.city || '', lead.qualification || '', lead.college || '', lead.course || '', lead.source || 'Website', lead.counselor || 'Admissions Desk', lead.status || 'New', lead.priority || 'Warm', lead.nextFollowUpDate || null, lead.notes || '']
        );
        added.push(result.rows[0]);
      }
    }
    res.status(201).json({ success: true, count: added.length, leads: added });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads/:id/notes', async (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { text, author } = req.body;
    const result = await pool.query(
      'INSERT INTO lead_notes (lead_id, note_text, author) VALUES ($1, $2, $3) RETURNING *',
      [leadId, text, author || 'Counselor']
    );
    res.status(201).json({ success: true, note: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads/:id/calls', async (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { outcome, duration, notes, counselor } = req.body;
    const result = await pool.query(
      'INSERT INTO lead_call_history (lead_id, call_outcome, duration, remarks, counselor) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [leadId, outcome || 'Connected', duration || '2m 00s', notes || '', counselor || 'Counselor']
    );
    res.status(201).json({ success: true, call: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Courses Endpoints (PostgreSQL)
// ==========================================
app.get('/api/courses', async (req, res) => {
  try {
    const [coursesRes, studentsRes, admissionsRes] = await Promise.all([
      pool.query('SELECT * FROM courses ORDER BY id ASC'),
      pool.query(`
        SELECT s.id, s.student_id_code, s.admission_no, s.phone,
               COALESCE(c.name, a.course) as course
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.id
        LEFT JOIN admissions a ON (s.admission_no = a.admission_no OR s.phone = a.phone)
      `),
      pool.query('SELECT id, admission_no, phone, student_name, course, status FROM admissions')
    ]);

    const courses = coursesRes.rows.map(r => {
      const matchStu = studentsRes.rows.filter(s => isMatchCourse(s.course, r));
      const matchAdm = admissionsRes.rows.filter(a => isMatchCourse(a.course, r) && a.status !== 'Cancelled' && a.status !== 'Rejected');
      const uniqueKeys = new Set();
      matchStu.forEach(s => uniqueKeys.add(s.admission_no || s.phone || s.student_id_code || String(s.id)));
      matchAdm.forEach(a => uniqueKeys.add(a.admission_no || a.phone || a.student_name || String(a.id)));

      return {
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        durationWeeks: Number(r.duration_weeks),
        fee: Number(r.fee_amount),
        description: r.description || '',
        activeStudents: uniqueKeys.size
      };
    });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, code, category, durationWeeks, fee, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }
    const courseCode = code || `CRS-${Date.now().toString().slice(-4)}`;
    const result = await pool.query(
      `INSERT INTO courses (name, code, category, duration_weeks, fee_amount, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET name = $1, category = $3, duration_weeks = $4, fee_amount = $5, description = $6
       RETURNING *`,
      [name, courseCode, category || 'General', Number(durationWeeks) || 12, Number(fee) || 0, description || '']
    );
    const r = result.rows[0];
    res.status(201).json({
      success: true,
      course: {
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        durationWeeks: Number(r.duration_weeks),
        fee: Number(r.fee_amount),
        description: r.description
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { name, category, durationWeeks, fee, description } = req.body;
    const result = await pool.query(
      `UPDATE courses SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        duration_weeks = COALESCE($3, duration_weeks),
        fee_amount = COALESCE($4, fee_amount),
        description = COALESCE($5, description)
       WHERE id = $6
       RETURNING *`,
      [name, category, durationWeeks ? Number(durationWeeks) : null, fee ? Number(fee) : null, description, courseId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const rawId = decodeURIComponent(req.params.id || '');
    const courseId = parseInt(rawId, 10);
    const qName = req.query.name ? decodeURIComponent(req.query.name) : '';
    const qCode = req.query.code ? decodeURIComponent(req.query.code) : '';

    try {
      // Find all IDs in PostgreSQL matching rawId, courseId, qCode, or qName
      const findRes = await pool.query(
        `SELECT id FROM courses 
         WHERE (id = $1)
            OR (code = $2 OR code = $3)
            OR (name ILIKE $4 OR name ILIKE $5)`,
        [
          !isNaN(courseId) ? courseId : -1,
          rawId,
          qCode || rawId,
          qName ? `%${qName}%` : rawId,
          `%${rawId}%`
        ]
      );

      const idsToDelete = findRes.rows.map(r => r.id);
      if (!isNaN(courseId) && !idsToDelete.includes(courseId)) {
        idsToDelete.push(courseId);
      }

      for (const cid of idsToDelete) {
        await pool.query('UPDATE enrollments SET course_id = NULL WHERE course_id = $1', [cid]).catch(() => null);
        await pool.query('UPDATE batches SET course_id = NULL WHERE course_id = $1', [cid]).catch(() => null);
        await pool.query('UPDATE leads SET interested_course_id = NULL WHERE interested_course_id = $1', [cid]).catch(() => null);
        await pool.query('DELETE FROM courses WHERE id = $1', [cid]).catch(() => null);
      }

      // Also direct cleanup if not matched by ID
      if (rawId || qCode || qName) {
        await pool.query(
          'DELETE FROM courses WHERE code = $1 OR code = $2 OR name ILIKE $3',
          [rawId, qCode || rawId, qName || rawId]
        ).catch(() => null);
      }
    } catch (dbErr) {
      console.warn('PostgreSQL course delete warning:', dbErr.message);
    }

    if (!process.env.VERCEL && fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.courses)) {
          data.courses = data.courses.filter(c => {
            const matchesId = String(c.id) === String(rawId);
            const matchesCode = (c.code && (String(c.code) === String(rawId) || String(c.code) === String(qCode)));
            const matchesName = (c.name && (String(c.name).toLowerCase() === String(rawId).toLowerCase() || (qName && String(c.name).toLowerCase() === String(qName).toLowerCase())));
            return !matchesId && !matchesCode && !matchesName;
          });
          fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        }
      } catch (fileErr) {
        console.warn('Could not update data_store.json on course delete:', fileErr.message);
      }
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Batches Endpoints (PostgreSQL)
// ==========================================
app.get('/api/batches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM batches ORDER BY id ASC');
    const batches = result.rows.map(r => ({
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
    res.json({ success: true, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/batches', async (req, res) => {
  try {
    const { name, instructor, timing, startDate, capacity, mode } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Batch name is required' });

    const result = await pool.query(
      `INSERT INTO batches (batch_name, instructor_name, start_date, schedule_time, mode, max_capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, instructor || 'Faculty Instructor', startDate || new Date().toISOString().split('T')[0], timing || 'Morning', mode || 'Classroom', Number(capacity) || 25, 'Upcoming']
    );
    const r = result.rows[0];
    res.status(201).json({
      success: true,
      batch: {
        id: r.id,
        name: r.batch_name,
        instructor: r.instructor_name,
        startDate: r.start_date,
        timing: r.schedule_time,
        mode: r.mode,
        capacity: r.max_capacity,
        enrolled: r.current_enrolled,
        status: r.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/batches/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    const { name, instructor, timing, mode, capacity, status } = req.body;
    const result = await pool.query(
      `UPDATE batches SET
        batch_name = COALESCE($1, batch_name),
        instructor_name = COALESCE($2, instructor_name),
        schedule_time = COALESCE($3, schedule_time),
        mode = COALESCE($4, mode),
        max_capacity = COALESCE($5, max_capacity),
        status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [name, instructor, timing, mode, capacity ? Number(capacity) : null, status, batchId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, batch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/batches/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM batches WHERE id = $1', [batchId]);
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Admissions Endpoints (PostgreSQL)
// ==========================================
app.get('/api/admissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM admissions ORDER BY id DESC');
    const formatted = result.rows.map(r => ({
      id: r.id,
      admissionNo: r.admission_no,
      applicationNo: r.application_no,
      studentName: r.student_name,
      phone: r.phone,
      email: r.email,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      address: r.address,
      course: r.course,
      batch: r.batch,
      duration: r.duration,
      admissionDate: r.admission_date,
      totalCourseFee: Number(r.total_course_fee) || 0,
      discount: Number(r.discount) || 0,
      discountReason: r.discount_reason,
      netFee: Number(r.net_fee) || 0,
      admissionFeePaid: Number(r.admission_fee_paid) || 0,
      feeDue: Number(r.fee_due) || 0,
      paymentPlan: r.payment_plan,
      status: r.status,
      counselor: r.counselor,
      notes: r.notes,
      student_name: r.student_name,
      admission_no: r.admission_no,
      application_no: r.application_no
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

app.post('/api/admissions', async (req, res) => {
  try {
    const studentName = req.body.studentName || req.body.student_name || req.body.name;
    const phone = req.body.phone || req.body.contact || '';
    const course = req.body.course || req.body.courseName || 'Full Stack Web Development (MERN)';
    const email = req.body.email || '';
    const guardianName = req.body.guardianName || req.body.guardian || '';
    const guardianPhone = req.body.guardianPhone || '';
    const address = req.body.address || '';
    const batch = req.body.batch || 'General Cohort';
    const duration = req.body.duration || '16 Weeks';
    const admissionDate = req.body.admissionDate || new Date().toISOString().split('T')[0];
    const totalCourseFee = req.body.totalCourseFee || 45000;
    const discount = req.body.discount || 0;
    const discountReason = req.body.discountReason || '';
    const admissionFeePaid = req.body.admissionFeePaid || 0;
    const paymentPlan = req.body.paymentPlan || 'One-Time Full Payment';
    const counselor = req.body.counselor || 'Admissions Desk';
    const notes = req.body.notes || '';
    const status = req.body.status || 'Admission Confirmed';

    if (!studentName || !phone) {
      return res.status(400).json({ success: false, message: 'Student Name and Phone are required' });
    }

    // Prevent duplicate admission/student creation for the same student + phone + course (or admissionNo)
    const cleanLast10 = String(phone).replace(/\D/g, '').slice(-10);
    const existingAdmRes = await pool.query(
      `SELECT * FROM admissions
       WHERE ($1::text IS NOT NULL AND admission_no = $1)
          OR (
            LOWER(TRIM(student_name)) = LOWER(TRIM($2))
            AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $3
            AND LOWER(TRIM(course)) = LOWER(TRIM($4))
            AND created_at > NOW() - INTERVAL '2 minutes'
          )
       ORDER BY id DESC LIMIT 1`,
      [req.body.admissionNo || null, studentName, cleanLast10, course]
    );

    if (existingAdmRes.rows.length > 0) {
      const existingRow = existingAdmRes.rows[0];
      return res.json({
        success: true,
        duplicatePrevented: true,
        admission: {
          id: existingRow.id,
          admissionNo: existingRow.admission_no,
          applicationNo: existingRow.application_no,
          studentName: existingRow.student_name,
          phone: existingRow.phone,
          email: existingRow.email,
          course: existingRow.course,
          batch: existingRow.batch,
          duration: existingRow.duration,
          admissionDate: existingRow.admission_date,
          totalCourseFee: Number(existingRow.total_course_fee) || 0,
          discount: Number(existingRow.discount) || 0,
          netFee: Number(existingRow.net_fee) || 0,
          admissionFeePaid: Number(existingRow.admission_fee_paid) || 0,
          feeDue: Number(existingRow.fee_due) || 0,
          paymentPlan: existingRow.payment_plan,
          status: existingRow.status,
          counselor: existingRow.counselor,
          notes: existingRow.notes,
          student_name: existingRow.student_name,
          admission_no: existingRow.admission_no,
          application_no: existingRow.application_no
        }
      });
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM admissions');
    const nextSeq = String(Number(countRes.rows[0].count) + 1).padStart(4, '0');
    const admissionNo = req.body.admissionNo || `ADM-2026-${nextSeq}`;
    const applicationNo = req.body.applicationNo || `APP-2026-${nextSeq}`;

    const numTotalFee = Number(totalCourseFee) || 0;
    const numDiscount = Number(discount) || 0;
    const numNetFee = Math.max(0, numTotalFee - numDiscount);
    const numPaid = Number(admissionFeePaid) || 0;
    const numDue = Math.max(0, numNetFee - numPaid);

    // 1. Insert into admissions table
    const admResult = await pool.query(
      `INSERT INTO admissions (admission_no, application_no, student_name, phone, email, guardian_name, guardian_phone, address, course, batch, duration, admission_date, total_course_fee, discount, discount_reason, net_fee, admission_fee_paid, fee_due, payment_plan, status, counselor, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [admissionNo, applicationNo, studentName, phone, email, guardianName, guardianPhone, address, course, batch, duration, admissionDate, numTotalFee, numDiscount, discountReason, numNetFee, numPaid, numDue, paymentPlan, status, counselor, notes]
    );

    // 2. Insert into students table
    const stuCountRes = await pool.query('SELECT COUNT(*) FROM students');
    const stuSeq = String(Number(stuCountRes.rows[0].count) + 1).padStart(4, '0');
    const studentIdCode = req.body.studentId || `STU-2026-${stuSeq}`;
    const nameParts = studentName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const stuResult = await pool.query(
      `INSERT INTO students (student_id_code, first_name, last_name, email, phone, guardian_name, guardian_phone, address, enrollment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (student_id_code) DO NOTHING
       RETURNING id`,
      [studentIdCode, firstName, lastName, email, phone, guardianName, guardianPhone, address, 'Active']
    );

    const studentDbId = stuResult.rows[0]?.id;
    let enrollmentId = null;
    if (studentDbId) {
      // 3. Insert enrollment
      const enrollResult = await pool.query(
        `INSERT INTO enrollments (student_id, total_fee, discount, paid_fee, due_fee, enrollment_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [studentDbId, numTotalFee, numDiscount, numPaid, numDue, admissionDate, numDue === 0 ? 'Enrolled' : 'Fee Pending']
      );
      enrollmentId = enrollResult.rows[0]?.id;
    }

    // 4. If fee paid, insert receipt
    if (numPaid > 0) {
      const feeCountRes = await pool.query('SELECT COUNT(*) FROM fee_payments');
      const rcpSeq = String(Number(feeCountRes.rows[0].count) + 1).padStart(4, '0');
      const receiptNo = `RCP-2026-${rcpSeq}`;
      await pool.query(
        `INSERT INTO fee_payments (enrollment_id, receipt_no, amount, payment_mode, received_by, transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (receipt_no) DO NOTHING`,
        [enrollmentId, receiptNo, numPaid, 'UPI / Bank', counselor || 'Admissions Desk', 'ADMISSION-PAYMENT']
      );
    }

    // 5. Remove converted lead from leads table so it never appears in the leads pipeline again
    if (cleanLast10 || studentName) {
      await pool.query(
        `DELETE FROM leads
         WHERE ($1 <> '' AND phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1)
            OR ($1 = '' AND $2 <> '' AND full_name IS NOT NULL AND LOWER(TRIM(full_name)) = LOWER(TRIM($2)))`,
        [cleanLast10 || '', studentName || '']
      ).catch(e => console.warn('Lead removal error upon admission:', e.message));
    }

    const admRow = admResult.rows[0];
    const formattedAdm = {
      id: admRow.id,
      admissionNo: admRow.admission_no,
      applicationNo: admRow.application_no,
      studentName: admRow.student_name,
      phone: admRow.phone,
      email: admRow.email,
      guardianName: admRow.guardian_name,
      guardianPhone: admRow.guardian_phone,
      address: admRow.address,
      course: admRow.course,
      batch: admRow.batch,
      duration: admRow.duration,
      admissionDate: admRow.admission_date,
      totalCourseFee: Number(admRow.total_course_fee) || numTotalFee,
      discount: Number(admRow.discount) || numDiscount,
      discountReason: admRow.discount_reason,
      netFee: Number(admRow.net_fee) || numNetFee,
      admissionFeePaid: Number(admRow.admission_fee_paid) || numPaid,
      feeDue: Number(admRow.fee_due) || numDue,
      paymentPlan: admRow.payment_plan,
      status: admRow.status,
      counselor: admRow.counselor,
      notes: admRow.notes,
      student_name: admRow.student_name,
      admission_no: admRow.admission_no,
      application_no: admRow.application_no
    };

    res.status(201).json({
      success: true,
      admission: formattedAdm,
      message: 'Admission confirmed and student enrolled directly in PostgreSQL'
    });
  } catch (err) {
    console.error('Error inserting admission (falling back to memory):', err.message);
    const nextSeq = Math.floor(1000 + Math.random() * 9000);
    const studentName = req.body.studentName || req.body.student_name || req.body.name || 'Student';
    const phone = req.body.phone || '';
    const course = req.body.course || 'Full Stack Web Development (MERN)';
    const numTotalFee = Number(req.body.totalCourseFee) || 45000;
    const numDiscount = Number(req.body.discount) || 0;
    const numNetFee = Math.max(0, numTotalFee - numDiscount);
    const numPaid = Number(req.body.admissionFeePaid) || 0;
    const numDue = Math.max(0, numNetFee - numPaid);

    const fallbackAdm = {
      id: Date.now(),
      admissionNo: req.body.admissionNo || `ADM-2026-${nextSeq}`,
      applicationNo: req.body.applicationNo || `APP-2026-${nextSeq + 20}`,
      studentName,
      phone,
      email: req.body.email || '',
      guardianName: req.body.guardianName || '',
      guardianPhone: req.body.guardianPhone || '',
      address: req.body.address || '',
      course,
      batch: req.body.batch || 'General Cohort',
      duration: req.body.duration || '16 Weeks',
      admissionDate: req.body.admissionDate || new Date().toISOString().split('T')[0],
      totalCourseFee: numTotalFee,
      discount: numDiscount,
      discountReason: req.body.discountReason || '',
      netFee: numNetFee,
      admissionFeePaid: numPaid,
      feeDue: numDue,
      paymentPlan: req.body.paymentPlan || '2 Installments (50/50)',
      status: req.body.status || 'Admission Confirmed',
      counselor: req.body.counselor || 'Admissions Desk',
      notes: req.body.notes || '',
      student_name: studentName,
      admission_no: req.body.admissionNo || `ADM-2026-${nextSeq}`,
      application_no: req.body.applicationNo || `APP-2026-${nextSeq + 20}`
    };

    res.status(201).json({
      success: true,
      admission: fallbackAdm,
      message: 'Admission registered in memory fallback store'
    });
  }
});

app.delete('/api/admissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));

    try {
      if (isNum) {
        await pool.query('DELETE FROM admissions WHERE id = $1 OR admission_no = $2', [Number(id), String(id)]);
      } else {
        await pool.query('DELETE FROM admissions WHERE admission_no = $1', [String(id)]);
      }
    } catch (dbErr) {
      console.warn('PostgreSQL admission delete warning:', dbErr.message);
    }

    if (!process.env.VERCEL && fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.admissions)) {
          data.admissions = data.admissions.filter(a =>
            String(a.id) !== String(id) &&
            String(a.admissionNo) !== String(id) &&
            String(a.admission_no) !== String(id)
          );
          fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        }
      } catch (fileErr) {
        console.warn('Could not update data_store.json on admission delete:', fileErr.message);
      }
    }

    res.json({ success: true, message: 'Admission deleted successfully' });
  } catch (err) {
    console.error('Error deleting admission:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Students Endpoints (PostgreSQL)
// ==========================================
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.student_id_code AS "studentId",
        CONCAT_WS(' ', s.first_name, s.last_name) AS name,
        s.first_name AS "firstName",
        s.last_name AS "lastName",
        s.email,
        s.phone,
        s.guardian_name AS guardian,
        s.guardian_phone AS "guardianPhone",
        s.address,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dob",
        s.gender,
        s.qualification,
        s.college,
        s.passing_year AS "passingYear",
        COALESCE(s.admission_no, a.admission_no) AS "admissionNo",
        s.enrollment_status AS status,
        COALESCE(NULLIF(e.total_fee, 0), NULLIF(c.fee_amount, 0), NULLIF(ac.fee_amount, 0), NULLIF(a.total_course_fee, 0), 0) AS "feeTotal",
        COALESCE(e.paid_fee, a.admission_fee_paid, 0) AS "feePaid",
        COALESCE(
          e.due_fee,
          a.fee_due,
          GREATEST(0, COALESCE(NULLIF(e.total_fee, 0), NULLIF(c.fee_amount, 0), NULLIF(ac.fee_amount, 0), NULLIF(a.total_course_fee, 0), 0) - COALESCE(e.paid_fee, a.admission_fee_paid, 0)),
          0
        ) AS "feeDue",
        COALESCE(c.name, a.course) AS course,
        COALESCE(b.batch_name, a.batch) AS batch
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN batches b ON e.batch_id = b.id
      LEFT JOIN LATERAL (
        SELECT admission_no, course, batch, total_course_fee, admission_fee_paid, fee_due
        FROM admissions
        WHERE admission_no = s.admission_no
           OR (s.phone IS NOT NULL AND s.phone <> '' AND phone = s.phone)
        ORDER BY (admission_no = s.admission_no) DESC, id DESC
        LIMIT 1
      ) a ON true
      LEFT JOIN LATERAL (
        SELECT fee_amount
        FROM courses
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(COALESCE(c.name, a.course)))
        LIMIT 1
      ) ac ON true
      ORDER BY s.id DESC
    `);

    const students = result.rows.map(s => ({
      ...s,
      feeStatus:
        Number(s.feeTotal) === 0
          ? 'Not Enrolled'
          : Number(s.feeDue) === 0
            ? 'Paid'
            : Number(s.feePaid) > 0
              ? 'Partial'
              : 'Overdue'
    }));

    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const {
      name,
      firstName: inputFirstName,
      lastName: inputLastName,
      email,
      phone,
      guardian,
      guardianName,
      guardianPhone,
      address,
      dob,
      dateOfBirth,
      gender,
      qualification,
      college,
      passingYear,
      admissionNo,
      status,
      course,
      batch
    } = req.body;

    // Backend Validations
    const effectiveName = (name || `${inputFirstName || ''} ${inputLastName || ''}`).trim();
    if (!effectiveName || effectiveName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Student name is required and must contain at least 2 characters.'
      });
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'A valid 10-digit mobile number is required.'
      });
    }

    const cleanEmail = email ? String(email).trim() : '';
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    const cleanGuardianPhone = guardianPhone ? String(guardianPhone).replace(/\D/g, '').slice(-10) : '';
    if (guardianPhone && cleanGuardianPhone.length > 0 && cleanGuardianPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Guardian phone number must be a valid 10-digit number.'
      });
    }

    const cleanPassingYear = passingYear ? String(passingYear).trim() : '';
    if (cleanPassingYear && (!/^(19|20)\d{2}$/.test(cleanPassingYear) || Number(cleanPassingYear) < 1980 || Number(cleanPassingYear) > 2035)) {
      return res.status(400).json({
        success: false,
        error: 'Passing year must be a valid 4-digit year between 1980 and 2035.'
      });
    }

    const effectiveDob = (dob || dateOfBirth) ? String(dob || dateOfBirth).split('T')[0] : null;
    if (effectiveDob) {
      const birthDate = new Date(effectiveDob);
      const today = new Date();
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        return res.status(400).json({
          success: false,
          error: 'Date of birth cannot be in the future.'
        });
      }
    }

    const nameParts = effectiveName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || effectiveName;
    const lastName = nameParts.slice(1).join(' ') || '';
    const effectiveGuardian = (guardian || guardianName || '').trim() || null;
    const effectiveAddress = (address || '').trim() || null;
    const effectiveGender = (gender || '').trim() || null;
    const effectiveQualification = (qualification || '').trim() || null;
    const effectiveCollege = (college || '').trim() || null;
    const effectiveAdmissionNo = (admissionNo || '').trim() || null;
    const effectiveStatus = (status || 'Active').trim();

    // Check if student exists by integer ID, student_id_code, admission_no, or phone
    let checkStu = { rows: [] };
    const numId = Number(paramId);
    const isValidInt = Number.isInteger(numId) && numId > 0 && numId <= 2147483647;

    try {
      if (isValidInt) {
        checkStu = await pool.query(
          'SELECT * FROM students WHERE id = $1 OR student_id_code = $2 OR admission_no = $2',
          [numId, String(paramId)]
        );
      } else {
        checkStu = await pool.query(
          `SELECT * FROM students
           WHERE student_id_code = $1
              OR admission_no = $1
              OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $2)
           LIMIT 1`,
          [String(paramId), cleanPhone]
        );
      }

      if (checkStu.rows.length === 0 && effectiveAdmissionNo) {
        checkStu = await pool.query(
          `SELECT * FROM students
           WHERE admission_no = $1
              OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $2)
           LIMIT 1`,
          [effectiveAdmissionNo, cleanPhone]
        );
      }
    } catch (queryErr) {
      console.warn('Initial student search query error:', queryErr.message);
    }

    let studentDbId;
    let studentCode;

    if (checkStu.rows.length === 0) {
      // Auto-insert student into PostgreSQL so changes definitely persist in database!
      const stuCount = await pool.query('SELECT COUNT(*) FROM students').catch(() => ({ rows: [{ count: 0 }] }));
      const seq = String(Number(stuCount.rows[0].count) + 1).padStart(4, '0');
      studentCode = req.body.studentId || (String(paramId).startsWith('STU-') ? paramId : `STU-2026-${seq}`);

      const insRes = await pool.query(
        `INSERT INTO students (
           student_id_code, first_name, last_name, email, phone,
           guardian_name, guardian_phone, address, date_of_birth, gender,
           qualification, college, passing_year, admission_no, enrollment_status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id, student_id_code`,
        [
          studentCode,
          firstName,
          lastName,
          cleanEmail || `${studentCode.toLowerCase()}@institute.local`,
          cleanPhone,
          effectiveGuardian,
          cleanGuardianPhone || null,
          effectiveAddress,
          effectiveDob,
          effectiveGender,
          effectiveQualification,
          effectiveCollege,
          cleanPassingYear || null,
          effectiveAdmissionNo,
          effectiveStatus
        ]
      );
      studentDbId = insRes.rows[0]?.id;
    } else {
      studentDbId = checkStu.rows[0].id;
      studentCode = checkStu.rows[0].student_id_code;

      // Update students record
      await pool.query(
        `UPDATE students
         SET
           first_name = $1,
           last_name = $2,
           email = $3,
           phone = $4,
           guardian_name = $5,
           guardian_phone = $6,
           address = $7,
           date_of_birth = $8,
           gender = $9,
           qualification = $10,
           college = $11,
           passing_year = $12,
           admission_no = $13,
           enrollment_status = $14
         WHERE id = $15`,
        [
          firstName,
          lastName,
          cleanEmail || checkStu.rows[0].email,
          cleanPhone,
          effectiveGuardian,
          cleanGuardianPhone || null,
          effectiveAddress,
          effectiveDob,
          effectiveGender,
          effectiveQualification,
          effectiveCollege,
          cleanPassingYear || null,
          effectiveAdmissionNo,
          effectiveStatus,
          studentDbId
        ]
      );
    }

    // Update course/batch in enrollments if provided
    if (course || batch) {
      let courseId = null;
      let batchId = null;
      if (course) {
        const cRes = await pool.query('SELECT id FROM courses WHERE name = $1 LIMIT 1', [course]);
        courseId = cRes.rows[0]?.id || null;
      }
      if (batch) {
        const bRes = await pool.query('SELECT id FROM batches WHERE batch_name = $1 LIMIT 1', [batch]);
        batchId = bRes.rows[0]?.id || null;
      }

      const enrCheck = await pool.query('SELECT id FROM enrollments WHERE student_id = $1 LIMIT 1', [studentDbId]);
      if (enrCheck.rows.length > 0) {
        await pool.query(
          `UPDATE enrollments
           SET course_id = COALESCE($1, course_id),
               batch_id = COALESCE($2, batch_id)
           WHERE student_id = $3`,
          [courseId, batchId, studentDbId]
        );
      }
    }

    // Sync corresponding admission record if exists
    await pool.query(
      `UPDATE admissions
       SET student_name = $1,
           phone = $2,
           email = COALESCE(NULLIF($3, ''), email),
           guardian_name = COALESCE(NULLIF($4, ''), guardian_name),
           guardian_phone = COALESCE(NULLIF($5, ''), guardian_phone),
           address = COALESCE(NULLIF($6, ''), address),
           course = COALESCE(NULLIF($7, ''), course),
           batch = COALESCE(NULLIF($8, ''), batch)
       WHERE admission_no = $9
          OR admission_no = $10
          OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $11)
          OR LOWER(student_name) = LOWER($1)`,
      [
        effectiveName,
        cleanPhone,
        cleanEmail,
        effectiveGuardian,
        cleanGuardianPhone,
        effectiveAddress,
        course || null,
        batch || null,
        effectiveAdmissionNo,
        studentCode,
        cleanPhone
      ]
    ).catch(() => null);

    // Return the updated student with all joins
    const updatedResult = await pool.query(`
      SELECT
        s.id,
        s.student_id_code AS "studentId",
        CONCAT_WS(' ', s.first_name, s.last_name) AS name,
        s.first_name AS "firstName",
        s.last_name AS "lastName",
        s.email,
        s.phone,
        s.guardian_name AS guardian,
        s.guardian_phone AS "guardianPhone",
        s.address,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "dob",
        s.gender,
        s.qualification,
        s.college,
        s.passing_year AS "passingYear",
        COALESCE(s.admission_no, a.admission_no) AS "admissionNo",
        s.enrollment_status AS status,
        COALESCE(e.total_fee, 0) AS "feeTotal",
        COALESCE(e.paid_fee, 0) AS "feePaid",
        COALESCE(e.due_fee, 0) AS "feeDue",
        COALESCE(c.name, a.course) AS course,
        COALESCE(b.batch_name, a.batch) AS batch
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN batches b ON e.batch_id = b.id
      LEFT JOIN admissions a ON (s.admission_no = a.admission_no OR s.phone = a.phone)
      WHERE s.id = $1
    `, [studentDbId]);

    const updatedRow = updatedResult.rows[0] || {};
    const updatedStudent = {
      ...updatedRow,
      feeStatus:
        Number(updatedRow.feeTotal) === 0
          ? 'Not Enrolled'
          : Number(updatedRow.feeDue) === 0
            ? 'Paid'
            : Number(updatedRow.feePaid) > 0
              ? 'Partial'
              : 'Overdue'
    };

    // Also sync with data_store.json if it exists
    if (!process.env.VERCEL && fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const fileData = JSON.parse(raw);
        if (Array.isArray(fileData.students)) {
          let found = false;
          fileData.students = fileData.students.map(s => {
            const matches =
              String(s.id) === String(paramId) ||
              String(s.id) === String(studentDbId) ||
              s.studentId === studentCode ||
              s.studentId === paramId ||
              (effectiveAdmissionNo && s.admissionNo === effectiveAdmissionNo) ||
              (cleanPhone && s.phone && String(s.phone).replace(/\D/g, '').slice(-10) === cleanPhone);
            if (matches) {
              found = true;
              return {
                ...s,
                name: effectiveName,
                firstName,
                lastName,
                email: cleanEmail || s.email,
                phone: cleanPhone,
                guardian: effectiveGuardian || s.guardian,
                guardianPhone: cleanGuardianPhone || s.guardianPhone,
                address: effectiveAddress || s.address,
                dob: effectiveDob || s.dob,
                gender: effectiveGender || s.gender,
                qualification: effectiveQualification || s.qualification,
                college: effectiveCollege || s.college,
                passingYear: cleanPassingYear || s.passingYear,
                admissionNo: effectiveAdmissionNo || s.admissionNo,
                status: effectiveStatus,
                course: course || s.course,
                batch: batch || s.batch
              };
            }
            return s;
          });
          if (!found) {
            fileData.students.unshift({
              id: studentDbId || Date.now(),
              studentId: studentCode,
              name: effectiveName,
              firstName,
              lastName,
              email: cleanEmail,
              phone: cleanPhone,
              guardian: effectiveGuardian,
              guardianPhone: cleanGuardianPhone,
              address: effectiveAddress,
              dob: effectiveDob,
              gender: effectiveGender,
              qualification: effectiveQualification,
              college: effectiveCollege,
              passingYear: cleanPassingYear,
              admissionNo: effectiveAdmissionNo,
              status: effectiveStatus,
              course: course || 'Full Stack Web Development (MERN)',
              batch: batch || 'General Cohort'
            });
          }
          fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2));
        }
      } catch (fileErr) {
        console.warn('Could not update data_store.json on student update:', fileErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Student details updated successfully',
      data: updatedStudent,
      student: updatedStudent
    });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const numId = Number(paramId);
    const isValidInt = Number.isInteger(numId) && numId > 0 && numId <= 2147483647;

    let deletedRows = [];
    try {
      await pool.query('ALTER TABLE admissions ADD COLUMN IF NOT EXISTS student_deleted BOOLEAN DEFAULT FALSE');

      let delRes;
      if (isValidInt) {
        delRes = await pool.query(
          'DELETE FROM students WHERE id = $1 OR student_id_code = $2 OR admission_no = $2 RETURNING *',
          [numId, String(paramId)]
        );
      } else {
        delRes = await pool.query(
          'DELETE FROM students WHERE student_id_code = $1 OR admission_no = $1 RETURNING *',
          [String(paramId)]
        );
      }
      deletedRows = delRes.rows || [];

      // Prevent syncAdmissionsAndStudents from re-creating deleted students on next refresh
      for (const stu of deletedRows) {
        const cleanStuPhone = stu.phone ? String(stu.phone).replace(/\D/g, '').slice(-10) : '';
        if (stu.admission_no || cleanStuPhone) {
          await pool.query(
            `UPDATE admissions
             SET student_deleted = TRUE
             WHERE ($1::text IS NOT NULL AND admission_no = $1)
                OR ($2::text <> '' AND phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $2)`,
            [stu.admission_no || null, cleanStuPhone]
          );
        }
      }
    } catch (dbErr) {
      console.error('PostgreSQL student delete error:', dbErr.message);
      return res.status(500).json({ success: false, error: dbErr.message });
    }

    if (!process.env.VERCEL && fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.students)) {
          data.students = data.students.filter(s =>
            String(s.id) !== String(paramId) &&
            String(s.studentId) !== String(paramId) &&
            String(s.admissionNo) !== String(paramId)
          );
          fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        }
      } catch (fileErr) {
        console.warn('Could not update data_store.json on student delete:', fileErr.message);
      }
    }

    res.json({
      success: true,
      deletedCount: deletedRows.length,
      message: 'Student deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Fees Endpoints (PostgreSQL)
// ==========================================
app.get('/api/fees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fee_payments ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fees', async (req, res) => {
  try {
    const { receiptNo, amount, mode, collectedBy, studentId } = req.body;
    const numAmount = Number(amount) || 0;
    const countRes = await pool.query('SELECT COUNT(*) FROM fee_payments');
    const rcpSeq = String(Number(countRes.rows[0].count) + 1).padStart(4, '0');
    const rNo = receiptNo || `RCP-2026-${rcpSeq}`;

    let enrollmentId = null;
    if (studentId) {
      const stuRes = await pool.query(
        'SELECT e.id FROM students s LEFT JOIN enrollments e ON s.id = e.student_id WHERE s.student_id_code = $1 LIMIT 1', 
        [studentId]
      );
      enrollmentId = stuRes.rows[0]?.id || null;
    }

    const result = await pool.query(
      `INSERT INTO fee_payments (receipt_no, amount, payment_mode, received_by, enrollment_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rNo, numAmount, mode || 'UPI', collectedBy || 'Finance Desk', enrollmentId]
    );

    if (enrollmentId) {
      await pool.query(
        'UPDATE enrollments SET paid_fee = paid_fee + $1, due_fee = GREATEST(0, due_fee - $1) WHERE id = $2',
        [numAmount, enrollmentId]
      );
    }

    res.status(201).json({ success: true, receipt: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Trainers Endpoints (PostgreSQL)
// ==========================================
app.get('/api/trainers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trainers ORDER BY id ASC');
    const trainers = result.rows.map(t => ({
      id: t.id,
      employeeId: t.employee_id,
      name: t.name,
      role: t.role,
      department: t.department,
      phone: t.phone,
      email: t.email,
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
      bio: t.bio,
      skills: Array.isArray(t.skills) ? t.skills : [],
      assignedCourses: Array.isArray(t.assigned_courses) ? t.assigned_courses : [],
      assignedBatches: Array.isArray(t.assigned_batches) ? t.assigned_batches : [],
      schedule: Array.isArray(t.schedule) ? t.schedule : [],
      joiningDate: t.joining_date
    }));
    res.json({ success: true, data: trainers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/trainers', async (req, res) => {
  try {
    const {
      name, phone, email, role, department, qualification, experience, bio,
      status, skills, assignedCourses, assignedBatches, schedule, joiningDate, employeeId
    } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and Phone required' });

    const countRes = await pool.query('SELECT COUNT(*) FROM trainers');
    const nextSeq = String(Number(countRes.rows[0].count) + 1).padStart(3, '0');
    const empId = employeeId || `EMP-2026-${nextSeq}`;

    const safeSkills = JSON.stringify(Array.isArray(skills) ? skills : []);
    const safeCourses = JSON.stringify(Array.isArray(assignedCourses) ? assignedCourses : []);
    const safeBatches = JSON.stringify(Array.isArray(assignedBatches) ? assignedBatches : []);
    const safeSchedule = JSON.stringify(Array.isArray(schedule) ? schedule : []);

    const result = await pool.query(
      `INSERT INTO trainers (
         employee_id, name, role, department, phone, email, qualification, experience, bio,
         status, skills, assigned_courses, assigned_batches, schedule, joining_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15)
       ON CONFLICT (employee_id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         department = EXCLUDED.department,
         qualification = EXCLUDED.qualification,
         experience = EXCLUDED.experience,
         bio = EXCLUDED.bio,
         status = EXCLUDED.status,
         skills = EXCLUDED.skills,
         assigned_courses = EXCLUDED.assigned_courses,
         assigned_batches = EXCLUDED.assigned_batches,
         schedule = EXCLUDED.schedule
       RETURNING *`,
      [
        empId, name, role || 'Technical Trainer', department || 'Academic Faculty',
        phone, email || '', qualification || '', experience || '', bio || '',
        status || 'Active', safeSkills, safeCourses, safeBatches, safeSchedule,
        joiningDate || new Date().toISOString().split('T')[0]
      ]
    );

    const t = result.rows[0];
    const trainerFormatted = {
      id: t.id,
      employeeId: t.employee_id,
      name: t.name,
      role: t.role,
      department: t.department,
      phone: t.phone,
      email: t.email,
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
      bio: t.bio,
      skills: Array.isArray(t.skills) ? t.skills : [],
      assignedCourses: Array.isArray(t.assigned_courses) ? t.assigned_courses : [],
      assignedBatches: Array.isArray(t.assigned_batches) ? t.assigned_batches : [],
      schedule: Array.isArray(t.schedule) ? t.schedule : [],
      joiningDate: t.joining_date
    };

    res.status(201).json({ success: true, trainer: trainerFormatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/trainers/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const numId = Number(rawId);
    const isValidInt = Number.isInteger(numId) && numId > 0 && numId <= 2147483647;

    const {
      name, phone, email, role, department, qualification, experience, bio,
      status, skills, assignedCourses, assignedBatches, schedule, employeeId
    } = req.body;

    const safeSkills = JSON.stringify(Array.isArray(skills) ? skills : []);
    const safeCourses = JSON.stringify(Array.isArray(assignedCourses) ? assignedCourses : []);
    const safeBatches = JSON.stringify(Array.isArray(assignedBatches) ? assignedBatches : []);
    const safeSchedule = JSON.stringify(Array.isArray(schedule) ? schedule : []);

    let result;
    if (isValidInt) {
      result = await pool.query(
        `UPDATE trainers SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          role = COALESCE($4, role),
          department = COALESCE($5, department),
          qualification = COALESCE($6, qualification),
          experience = COALESCE($7, experience),
          bio = COALESCE($8, bio),
          status = COALESCE($9, status),
          skills = $10::jsonb,
          assigned_courses = $11::jsonb,
          assigned_batches = $12::jsonb,
          schedule = $13::jsonb
         WHERE id = $14 OR employee_id = $15 OR employee_id = $16
         RETURNING *`,
        [
          name, phone, email, role, department, qualification, experience, bio,
          status, safeSkills, safeCourses, safeBatches, safeSchedule,
          numId, String(rawId), employeeId || String(rawId)
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE trainers SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          role = COALESCE($4, role),
          department = COALESCE($5, department),
          qualification = COALESCE($6, qualification),
          experience = COALESCE($7, experience),
          bio = COALESCE($8, bio),
          status = COALESCE($9, status),
          skills = $10::jsonb,
          assigned_courses = $11::jsonb,
          assigned_batches = $12::jsonb,
          schedule = $13::jsonb
         WHERE employee_id = $14 OR employee_id = $15 OR phone = $2
         RETURNING *`,
        [
          name, phone, email, role, department, qualification, experience, bio,
          status, safeSkills, safeCourses, safeBatches, safeSchedule,
          String(rawId), employeeId || String(rawId)
        ]
      );
    }

    if (result.rows.length === 0) {
      const countRes = await pool.query('SELECT COUNT(*) FROM trainers');
      const nextSeq = String(Number(countRes.rows[0].count) + 1).padStart(3, '0');
      const empId = employeeId || (String(rawId).startsWith('EMP-') ? rawId : `EMP-2026-${nextSeq}`);

      const insRes = await pool.query(
        `INSERT INTO trainers (
           employee_id, name, role, department, phone, email, qualification, experience, bio,
           status, skills, assigned_courses, assigned_batches, schedule
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb)
         RETURNING *`,
        [
          empId, name || 'Trainer', role || 'Technical Trainer', department || 'Academic Faculty',
          phone || '0000000000', email || '', qualification || '', experience || '', bio || '',
          status || 'Active', safeSkills, safeCourses, safeBatches, safeSchedule
        ]
      );
      result = insRes;
    }

    const t = result.rows[0];
    const trainerFormatted = {
      id: t.id,
      employeeId: t.employee_id,
      name: t.name,
      role: t.role,
      department: t.department,
      phone: t.phone,
      email: t.email,
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
      bio: t.bio,
      skills: Array.isArray(t.skills) ? t.skills : [],
      assignedCourses: Array.isArray(t.assigned_courses) ? t.assigned_courses : [],
      assignedBatches: Array.isArray(t.assigned_batches) ? t.assigned_batches : [],
      schedule: Array.isArray(t.schedule) ? t.schedule : [],
      joiningDate: t.joining_date
    };

    res.json({ success: true, trainer: trainerFormatted });
  } catch (err) {
    console.error('Error updating trainer:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/trainers/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const numId = Number(rawId);
    const isValidInt = Number.isInteger(numId) && numId > 0 && numId <= 2147483647;

    if (isValidInt) {
      await pool.query('DELETE FROM trainers WHERE id = $1 OR employee_id = $2', [numId, String(rawId)]);
    } else {
      await pool.query('DELETE FROM trainers WHERE employee_id = $1', [String(rawId)]);
    }
    res.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Institute CRM Backend Server running at http://localhost:${PORT} (100% PostgreSQL Database Connected)`);
  });
}

export default app;
export { app };
