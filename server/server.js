import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, isConnected } from './db.js';

dotenv.config();

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
      mode: isConnected ? 'PostgreSQL Live' : 'Ready'
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

// Leads Endpoints
app.get('/api/leads', (req, res) => {
  res.json({ success: true, data: demoStore.recentLeads });
});

app.post('/api/leads', (req, res) => {
  const { name, phone, email, course, source, counselor, followUp, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required' });
  }

  const newLead = {
    id: Date.now(),
    name,
    phone,
    email: email || '',
    course: course || 'Full Stack Web Development (MERN)',
    source: source || 'Walk-in',
    status: 'New Inquiry',
    counselor: counselor || 'Admissions Desk',
    followUp: followUp || 'Call Pending',
    notes: notes || '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  demoStore.recentLeads.unshift(newLead);
  res.status(201).json({ success: true, lead: newLead });
});

app.put('/api/leads/:id', (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const index = demoStore.recentLeads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    demoStore.recentLeads[index] = { ...demoStore.recentLeads[index], ...req.body };
    return res.json({ success: true, lead: demoStore.recentLeads[index] });
  }
  res.status(404).json({ success: false, message: 'Lead not found' });
});

// Admissions Endpoints (Lead-to-student conversion without re-entering details)
app.get('/api/admissions', (req, res) => {
  res.json({ success: true, data: demoStore.admissions });
});

app.post('/api/admissions', (req, res) => {
  const {
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

  // Auto-generate official sequence numbers
  const nextSeq = String(demoStore.admissions.length + 1).padStart(4, '0');
  const admissionNo = `ADM-2026-${nextSeq}`;
  const applicationNo = `APP-2026-${nextSeq}`;

  const numTotalFee = Number(totalCourseFee) || 0;
  const numDiscount = Number(discount) || 0;
  const numNetFee = Math.max(0, numTotalFee - numDiscount);
  const numPaid = Number(admissionFeePaid) || 0;
  const numDue = Math.max(0, numNetFee - numPaid);

  const newAdmission = {
    id: Date.now(),
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

  demoStore.admissions.unshift(newAdmission);

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
  const newStudent = {
    id: Date.now(),
    studentId: `STU-2026-${stuSeq}`,
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
  demoStore.students.unshift(newStudent);

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
    return res.json({ success: true, admission: demoStore.admissions[index] });
  }
  res.status(404).json({ success: false, message: 'Admission record not found' });
});

// Students API
app.get('/api/students', (req, res) => {
  res.json({ success: true, data: demoStore.students });
});

// Courses API
app.get('/api/courses', (req, res) => {
  res.json({ success: true, data: demoStore.courses });
});

app.post('/api/courses', (req, res) => {
  const { name, code, category, durationWeeks, fee, description, modules } = req.body;
  const newCourse = {
    id: Date.now(),
    name,
    code: code || `CRS-${Date.now().toString().slice(-4)}`,
    category: category || 'General',
    durationWeeks: Number(durationWeeks) || 12,
    fee: Number(fee) || 0,
    activeStudents: 0,
    description: description || '',
    modules: modules || []
  };
  demoStore.courses.push(newCourse);
  res.status(201).json({ success: true, course: newCourse });
});

// Batches API
app.get('/api/batches', (req, res) => {
  res.json({ success: true, data: demoStore.batches });
});

app.post('/api/batches', (req, res) => {
  const { name, course, instructor, timing, startDate, capacity, mode, room } = req.body;
  const newBatch = {
    id: Date.now(),
    name,
    course,
    instructor: instructor || 'Staff Instructor',
    timing: timing || 'Morning',
    startDate: startDate || new Date().toISOString().split('T')[0],
    enrolled: 0,
    capacity: Number(capacity) || 25,
    mode: mode || 'Classroom',
    room: room || 'Room 1',
    status: 'Upcoming'
  };
  demoStore.batches.push(newBatch);
  res.status(201).json({ success: true, batch: newBatch });
});

// Fees API
app.get('/api/fees', (req, res) => {
  res.json({ success: true, data: demoStore.feeTransactions });
});

app.post('/api/fees', (req, res) => {
  const { studentName, studentId, course, amount, mode } = req.body;
  const numAmount = Number(amount) || 0;
  const rcpSeq = String(demoStore.feeTransactions.length + 1).padStart(4, '0');

  const newReceipt = {
    receiptNo: `RCP-2026-${rcpSeq}`,
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

  // Update student fee balance
  const student = demoStore.students.find(s => s.studentId === studentId || s.name.toLowerCase() === studentName?.toLowerCase());
  if (student) {
    student.feePaid += numAmount;
    student.feeDue = Math.max(0, student.feeTotal - student.feePaid);
    student.feeStatus = student.feeDue === 0 ? 'Paid' : 'Partial';
  }

  res.status(201).json({ success: true, receipt: newReceipt });
});

app.listen(PORT, () => {
  console.log(`🚀 Institute CRM Backend Server running at http://localhost:${PORT}`);
});
