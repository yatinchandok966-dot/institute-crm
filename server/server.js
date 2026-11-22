import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, isConnected } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback dataset for seamless offline and local development
const demoStore = {
  stats: {
    totalStudents: 342,
    activeStudentsGrowth: '+14.5%',
    newLeadsThisMonth: 86,
    leadConversionRate: '28.4%',
    confirmedAdmissions: 24,
    activeCourses: 6,
    activeBatches: 5,
    monthlyRevenue: 642000,
    revenueGrowth: '+18.2%',
    pendingFees: 128500,
    attendanceAverage: '92.4%',
    feeCollectionRate: '83.3%'
  },
  revenueTimeline: [
    { month: 'Jun', collected: 420000, target: 400000, admissions: 16 },
    { month: 'Jul', collected: 485000, target: 450000, admissions: 19 },
    { month: 'Aug', collected: 530000, target: 500000, admissions: 22 },
    { month: 'Sep', collected: 510000, target: 520000, admissions: 20 },
    { month: 'Oct', collected: 590000, target: 550000, admissions: 25 },
    { month: 'Nov', collected: 642000, target: 600000, admissions: 24 }
  ],
  courses: [
    {
      id: 1,
      name: 'Full Stack Web Development (MERN)',
      code: 'FSWD-101',
      category: 'Software Development',
      durationWeeks: 16,
      fee: 45000,
      activeStudents: 82,
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
      activeStudents: 64,
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
      activeStudents: 45,
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
      activeStudents: 38,
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
      activeStudents: 29,
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
      activeStudents: 34,
      description: 'AWS architecture, CI/CD pipelines, Docker containerization, and Terraform.',
      modules: ['Cloud Infrastructure Basics', 'Docker Containerization', 'Kubernetes Deployment', 'CI/CD Pipelines with GitHub Actions']
    }
  ],
  batches: [
    {
      id: 1,
      name: 'FSWD Morning Batch (M26)',
      course: 'Full Stack Web Development (MERN)',
      instructor: 'Prof. Alex Rivera',
      timing: 'Mon-Fri 09:00 AM - 11:30 AM',
      startDate: '2026-12-01',
      enrolled: 21,
      capacity: 25,
      mode: 'Hybrid',
      room: 'Lab 3 / Online',
      status: 'Upcoming'
    },
    {
      id: 2,
      name: 'Data Science Weekend Cohort (DS-14)',
      course: 'Data Science & Machine Learning with Python',
      instructor: 'Dr. Sunita Sharma',
      timing: 'Sat-Sun 10:00 AM - 02:00 PM',
      startDate: '2026-12-06',
      enrolled: 26,
      capacity: 30,
      mode: 'Online',
      room: 'Virtual Classroom 1',
      status: 'Upcoming'
    },
    {
      id: 3,
      name: 'UI/UX Evening Batch (U4)',
      course: 'UI/UX Product Design Masterclass',
      instructor: 'Vikram Mehta',
      timing: 'Mon-Wed-Fri 06:30 PM - 08:30 PM',
      startDate: '2026-11-10',
      enrolled: 18,
      capacity: 20,
      mode: 'Classroom',
      room: 'Design Studio A',
      status: 'Ongoing'
    },
    {
      id: 4,
      name: 'Cyber Security Sprint Cohort (SEC-09)',
      course: 'Cyber Security & Ethical Hacking',
      instructor: 'Rohan Kapoor',
      timing: 'Tue-Thu-Sat 03:00 PM - 05:30 PM',
      startDate: '2026-12-15',
      enrolled: 14,
      capacity: 20,
      mode: 'Hybrid',
      room: 'Security Lab 1',
      status: 'Upcoming'
    },
    {
      id: 5,
      name: 'Digital Marketing FastTrack',
      course: 'Digital Marketing & Growth Hacking',
      instructor: 'Ananya Sen',
      timing: 'Mon-Thu 07:00 PM - 09:00 PM',
      startDate: '2026-10-20',
      enrolled: 22,
      capacity: 22,
      mode: 'Online',
      room: 'Virtual Classroom 2',
      status: 'Ongoing'
    }
  ],
  recentLeads: [
    {
      id: 101,
      name: 'Riya Kapoor',
      phone: '+91 98765 43210',
      email: 'riya.k@example.com',
      city: 'Pune',
      qualification: 'B.Tech CS',
      college: 'Pune Institute of Computer Technology (PICT)',
      course: 'Full Stack Web Development (MERN)',
      source: 'Website',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-18',
      status: 'Counselling Scheduled',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-20T11:00',
      notes: 'B.Tech CS graduate. Attending demo counseling session. Looking for placement assistance.',
      notesList: [
        { id: 1, text: 'Inquired about weekend vs weekday MERN batch and placement track record.', date: '2026-11-18 10:30', author: 'Pooja Verma' },
        { id: 2, text: 'Shared syllabus and scheduled 1-on-1 counseling demo.', date: '2026-11-19 14:15', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-18 10:25', duration: '4m 10s', outcome: 'Connected - Interested', notes: 'First intro call. High interest in React & Node.js.', counselor: 'Pooja Verma' },
        { id: 2, date: '2026-11-19 16:00', duration: '2m 30s', outcome: 'Counseling Scheduled', notes: 'Confirmed demo session for today 11 AM.', counselor: 'Pooja Verma' }
      ]
    },
    {
      id: 102,
      name: 'Aman Verma',
      phone: '+91 98111 22334',
      email: 'aman.v@example.com',
      city: 'Mumbai',
      qualification: 'B.Sc Statistics',
      college: "St. Xavier's College, Mumbai",
      course: 'Data Science & Machine Learning with Python',
      source: 'Instagram',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-17',
      status: 'Follow-up Required',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-19T16:00',
      notes: 'Working as business analyst. Wants weekend batch. Requested installment options.',
      notesList: [
        { id: 1, text: 'Requested fee installment options and curriculum details for NLP modules.', date: '2026-11-17 11:20', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-17 11:15', duration: '5m 05s', outcome: 'Connected - Interested', notes: 'Discussed weekend schedule and fees.', counselor: 'Pooja Verma' },
        { id: 2, date: '2026-11-19 15:45', duration: '1m 20s', outcome: 'Call Back Requested', notes: 'In a meeting; follow-up call needed.', counselor: 'Pooja Verma' }
      ]
    },
    {
      id: 103,
      name: 'Neha Deshmukh',
      phone: '+91 97234 56789',
      email: 'neha.d@example.com',
      city: 'Pune',
      qualification: 'B.Des',
      college: 'MIT Institute of Design',
      course: 'UI/UX Product Design Masterclass',
      source: 'Walk-in',
      counselor: 'Karan Singhania',
      createdAt: '2026-11-20',
      status: 'Interested',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-21T14:30',
      notes: 'Visited campus today. Very keen on Figma design systems and UX portfolio project.',
      notesList: [
        { id: 1, text: 'Visited academy in person. Took lab tour with Karan.', date: '2026-11-20 12:00', author: 'Karan Singhania' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-20 16:30', duration: '3m 15s', outcome: 'Connected - Interested', notes: 'Follow-up after in-person visit. Sent brochure to parents.', counselor: 'Karan Singhania' }
      ]
    },
    {
      id: 104,
      name: 'Siddharth Joshi',
      phone: '+91 91234 09876',
      email: 'sid.j@example.com',
      city: 'Nagpur',
      qualification: 'BCA 3rd Year',
      college: 'Raisoni College of Engineering',
      course: 'Cyber Security & Ethical Hacking',
      source: 'Google Ads',
      counselor: 'Rohit Sharma',
      createdAt: '2026-11-19',
      status: 'Contacted',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-22T10:00',
      notes: 'Final year student looking for CEH certification curriculum and hands-on lab access.',
      notesList: [
        { id: 1, text: 'Filled inquiry from Google Ad campaign.', date: '2026-11-19 14:00', author: 'Rohit Sharma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-19 15:30', duration: '3m 40s', outcome: 'Connected - Interested', notes: 'Introductory discussion regarding lab setup and timings.', counselor: 'Rohit Sharma' }
      ]
    },
    {
      id: 105,
      name: 'Tanvi Agarwal',
      phone: '+91 98334 11223',
      email: 'tanvi.a@example.com',
      city: 'Bengaluru',
      qualification: 'BE Information Science',
      college: 'BMS College of Engineering',
      course: 'Cloud Computing & DevOps',
      source: 'LinkedIn',
      counselor: 'Karan Singhania',
      createdAt: '2026-11-20',
      status: 'New',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-20T17:30',
      notes: 'QA Engineer with 2 years experience transitioning to Cloud/DevOps. High intent.',
      notesList: [
        { id: 1, text: 'Inbound message on LinkedIn regarding AWS + Docker batch.', date: '2026-11-20 09:15', author: 'Karan Singhania' }
      ],
      callHistory: []
    },
    {
      id: 106,
      name: 'Rahul Kulkarni',
      phone: '+91 98450 11998',
      email: 'rahul.k@example.com',
      city: 'Pune',
      qualification: 'B.Com Graduate',
      college: 'BMCC Pune',
      course: 'Digital Marketing & Growth Hacking',
      source: 'Facebook',
      counselor: 'Ananya Sen',
      createdAt: '2026-11-15',
      status: 'Converted / Lost',
      priority: 'Cold',
      nextFollowUpDate: '2026-11-16T12:00',
      notes: 'Opted for distant university MBA instead. Retained for future short-term workshops.',
      notesList: [
        { id: 1, text: 'Expressed budget constraints and opted for alternate program.', date: '2026-11-16 12:10', author: 'Ananya Sen' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-15 11:00', duration: '4m 00s', outcome: 'Connected - Interested', notes: 'First briefing on course fees.', counselor: 'Ananya Sen' },
        { id: 2, date: '2026-11-16 12:05', duration: '2m 10s', outcome: 'Not Interested / Lost', notes: 'Decided not to enroll this session.', counselor: 'Ananya Sen' }
      ]
    },
    {
      id: 107,
      name: 'Sneha Reddy',
      phone: '+91 98555 44332',
      email: 'sneha.r@example.com',
      city: 'Hyderabad',
      qualification: 'B.Tech ECE',
      college: 'JNTU Hyderabad',
      course: 'Full Stack Web Development (MERN)',
      source: 'Referral',
      counselor: 'Vikram Mehta',
      createdAt: '2026-11-19',
      status: 'Interested',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-23T11:00',
      notes: 'Referred by alumni Dev Patel. Wants to join the morning hybrid cohort.',
      notesList: [
        { id: 1, text: 'Friend of current student Dev Patel. Fast-track admission interest.', date: '2026-11-19 16:40', author: 'Vikram Mehta' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-19 17:00', duration: '6m 20s', outcome: 'Connected - Interested', notes: 'Very positive call. Reviewing admission form.', counselor: 'Vikram Mehta' }
      ]
    },
    {
      id: 108,
      name: 'Aditya Saxena',
      phone: '+91 98222 33441',
      email: 'aditya.s@example.com',
      city: 'Noida',
      qualification: 'BCA',
      college: 'Amity University',
      course: 'Cyber Security & Ethical Hacking',
      source: 'Phone Call',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-20',
      status: 'New',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-20T15:00',
      notes: 'Inbounded via direct phone call inquiry. Sent syllabus brochure on WhatsApp.',
      notesList: [
        { id: 1, text: 'Direct incoming call on center hotline.', date: '2026-11-20 10:05', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-20 10:06', duration: '3m 50s', outcome: 'Connected - Interested', notes: 'Counseling scheduled for afternoon call.', counselor: 'Pooja Verma' }
      ]
    }
  ],
  admissions: [
    {
      id: 1,
      admissionNo: 'ADM-2026-0041',
      applicationNo: 'APP-2026-081',
      studentName: 'Aarav Mehta',
      phone: '+91 98223 11445',
      email: 'aarav.m@gmail.com',
      guardianName: 'Rajesh Mehta (Father)',
      guardianPhone: '+91 98223 99887',
      address: '402 Sunrise Heights, MG Road, Pune',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      duration: '16 Weeks',
      admissionDate: '2026-10-15',
      totalCourseFee: 45000,
      discount: 0,
      netFee: 45000,
      admissionFeePaid: 45000,
      feeDue: 0,
      paymentPlan: 'One-Time Full Payment',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Full payment made at time of admission. Verification complete.'
    },
    {
      id: 2,
      admissionNo: 'ADM-2026-0042',
      applicationNo: 'APP-2026-082',
      studentName: 'Priya Iyer',
      phone: '+91 98450 33211',
      email: 'priya.iyer@gmail.com',
      guardianName: 'Laxmi Iyer (Mother)',
      guardianPhone: '+91 98450 77665',
      address: '12 Emerald Park, Kothrud, Pune',
      course: 'Data Science & Machine Learning with Python',
      batch: 'Data Science Weekend Cohort (DS-14)',
      duration: '20 Weeks',
      admissionDate: '2026-10-22',
      totalCourseFee: 55000,
      discount: 5000,
      netFee: 50000,
      admissionFeePaid: 30000,
      feeDue: 20000,
      paymentPlan: '2 Installments (60/40)',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Early bird scholarship applied. 2nd installment due on Dec 1st.'
    },
    {
      id: 3,
      admissionNo: 'ADM-2026-0043',
      applicationNo: 'APP-2026-083',
      studentName: 'Kunal Deshmukh',
      phone: '+91 99123 44556',
      email: 'kunal.d@gmail.com',
      guardianName: 'Anand Deshmukh (Father)',
      guardianPhone: '+91 99123 88990',
      address: '77 Royal Palms, Aundh, Pune',
      course: 'UI/UX Product Design Masterclass',
      batch: 'UI/UX Evening Batch (U4)',
      duration: '12 Weeks',
      admissionDate: '2026-11-02',
      totalCourseFee: 35000,
      discount: 0,
      netFee: 35000,
      admissionFeePaid: 15000,
      feeDue: 20000,
      paymentPlan: '2 Installments (50/50)',
      status: 'Fee Pending',
      counselor: 'Karan Singhania',
      notes: 'Initial admission fee paid. Second installment overdue by 3 days.'
    },
    {
      id: 4,
      admissionNo: 'ADM-2026-0044',
      applicationNo: 'APP-2026-084',
      studentName: 'Dev Patel',
      phone: '+91 99887 76655',
      email: 'dev.p@example.com',
      guardianName: 'Suresh Patel (Father)',
      guardianPhone: '+91 99887 11223',
      address: 'B-14 Silver Oak, Baner, Pune',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      duration: '16 Weeks',
      admissionDate: '2026-11-18',
      totalCourseFee: 45000,
      discount: 3000,
      netFee: 42000,
      admissionFeePaid: 15000,
      feeDue: 27000,
      paymentPlan: '3 Installments (Installment 1 paid)',
      status: 'Document Verification',
      counselor: 'Karan Singhania',
      notes: 'Converted directly from referral lead. ID proof submitted; graduation marksheet pending.'
    },
    {
      id: 5,
      admissionNo: 'ADM-2026-0045',
      applicationNo: 'APP-2026-085',
      studentName: 'Simran Kaur',
      phone: '+91 98777 66554',
      email: 'simran.k@outlook.com',
      guardianName: 'Harpreet Kaur (Mother)',
      guardianPhone: '+91 98777 11223',
      address: 'Flat 502, Green Valley, Viman Nagar, Pune',
      course: 'Digital Marketing & Growth Hacking',
      batch: 'Digital Marketing FastTrack',
      duration: '10 Weeks',
      admissionDate: '2026-10-18',
      totalCourseFee: 28000,
      discount: 0,
      netFee: 28000,
      admissionFeePaid: 28000,
      feeDue: 0,
      paymentPlan: 'One-Time Full Payment',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Full fees cleared. Student kit issued.'
    }
  ],
  students: [
    {
      id: 1,
      studentId: 'STU-2026-081',
      admissionNo: 'ADM-2026-0041',
      name: 'Aarav Mehta',
      email: 'aarav.m@gmail.com',
      phone: '+91 98223 11445',
      guardian: 'Rajesh Mehta (Father)',
      guardianPhone: '+91 98223 99887',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      enrollmentDate: '2026-10-15',
      feeTotal: 45000,
      feePaid: 45000,
      feeDue: 0,
      feeStatus: 'Paid',
      attendance: 96,
      status: 'Active'
    },
    {
      id: 2,
      studentId: 'STU-2026-082',
      admissionNo: 'ADM-2026-0042',
      name: 'Priya Iyer',
      email: 'priya.iyer@gmail.com',
      phone: '+91 98450 33211',
      guardian: 'Laxmi Iyer (Mother)',
      guardianPhone: '+91 98450 77665',
      course: 'Data Science & Machine Learning with Python',
      batch: 'Data Science Weekend Cohort (DS-14)',
      enrollmentDate: '2026-10-22',
      feeTotal: 50000,
      feePaid: 30000,
      feeDue: 20000,
      feeStatus: 'Partial',
      attendance: 92,
      status: 'Active'
    },
    {
      id: 3,
      studentId: 'STU-2026-083',
      admissionNo: 'ADM-2026-0043',
      name: 'Kunal Deshmukh',
      email: 'kunal.d@gmail.com',
      phone: '+91 99123 44556',
      guardian: 'Anand Deshmukh (Father)',
      guardianPhone: '+91 99123 88990',
      course: 'UI/UX Product Design Masterclass',
      batch: 'UI/UX Evening Batch (U4)',
      enrollmentDate: '2026-11-02',
      feeTotal: 35000,
      feePaid: 15000,
      feeDue: 20000,
      feeStatus: 'Overdue',
      attendance: 78,
      status: 'Active'
    },
    {
      id: 4,
      studentId: 'STU-2026-084',
      admissionNo: 'ADM-2026-0044',
      name: 'Dev Patel',
      email: 'dev.p@example.com',
      phone: '+91 99887 76655',
      guardian: 'Suresh Patel (Father)',
      guardianPhone: '+91 99887 11223',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      enrollmentDate: '2026-11-18',
      feeTotal: 42000,
      feePaid: 15000,
      feeDue: 27000,
      feeStatus: 'Partial',
      attendance: 100,
      status: 'Active'
    },
    {
      id: 5,
      studentId: 'STU-2026-085',
      admissionNo: 'ADM-2026-0045',
      name: 'Simran Kaur',
      email: 'simran.k@outlook.com',
      phone: '+91 98777 66554',
      guardian: 'Harpreet Kaur (Mother)',
      guardianPhone: '+91 98777 11223',
      course: 'Digital Marketing & Growth Hacking',
      batch: 'Digital Marketing FastTrack',
      enrollmentDate: '2026-10-18',
      feeTotal: 28000,
      feePaid: 28000,
      feeDue: 0,
      feeStatus: 'Paid',
      attendance: 94,
      status: 'Active'
    }
  ],
  feeTransactions: [
    {
      receiptNo: 'RCP-2026-091',
      studentName: 'Aarav Mehta',
      studentId: 'STU-2026-081',
      course: 'Full Stack Web Development (MERN)',
      amount: 45000,
      mode: 'UPI (Google Pay)',
      date: '2026-11-19 14:32',
      collectedBy: 'Pooja Verma',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-090',
      studentName: 'Dev Patel',
      studentId: 'STU-2026-084',
      course: 'Full Stack Web Development (MERN)',
      amount: 15000,
      mode: 'Netbanking (HDFC)',
      date: '2026-11-18 11:20',
      collectedBy: 'Karan Singhania',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-089',
      studentName: 'Priya Iyer',
      studentId: 'STU-2026-082',
      course: 'Data Science & Machine Learning with Python',
      amount: 30000,
      mode: 'Credit Card',
      date: '2026-11-17 16:45',
      collectedBy: 'Finance Desk',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-088',
      studentName: 'Simran Kaur',
      studentId: 'STU-2026-085',
      course: 'Digital Marketing & Growth Hacking',
      amount: 28000,
      mode: 'UPI (PhonePe)',
      date: '2026-11-16 10:15',
      collectedBy: 'Front Desk',
      status: 'Success'
    }
  ]
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
    return res.json({
      success: true,
      stats: demoStore.stats,
      batches: demoStore.batches,
      courses: demoStore.courses,
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
  const {
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
    callHistory
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Full Name and Phone Number are required' });
  }

  const newLead = {
    id: Date.now(),
    name,
    phone,
    email: email || '',
    city: city || '',
    qualification: qualification || '',
    college: college || '',
    course: course || 'Full Stack Web Development (MERN)',
    source: source || 'Website',
    status: status || 'New',
    counselor: counselor || 'Pooja Verma',
    priority: priority || 'Warm',
    nextFollowUpDate: nextFollowUpDate || '',
    notes: notes || '',
    notesList: notesList || (notes ? [{
      id: Date.now(),
      text: notes,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: counselor || 'System'
    }] : []),
    callHistory: callHistory || [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  demoStore.recentLeads.unshift(newLead);
  demoStore.stats.newLeadsThisMonth = (demoStore.stats.newLeadsThisMonth || 86) + 1;

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

app.delete('/api/leads/:id', (req, res) => {
  const leadId = parseInt(req.params.id, 10);
  const index = demoStore.recentLeads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    const deleted = demoStore.recentLeads.splice(index, 1)[0];
    return res.json({ success: true, message: 'Lead deleted successfully', lead: deleted });
  }
  res.status(404).json({ success: false, message: 'Lead not found' });
});

// Bulk Import Leads Endpoint
app.post('/api/leads/bulk', (req, res) => {
  const { leads: incomingLeads } = req.body;
  if (!Array.isArray(incomingLeads)) {
    return res.status(400).json({ success: false, message: 'Expected an array of leads' });
  }

  const added = [];
  incomingLeads.forEach(lead => {
    if (lead && lead.name && lead.phone) {
      const formatted = {
        id: lead.id || (Date.now() + Math.floor(Math.random() * 10000)),
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        city: lead.city || '',
        qualification: lead.qualification || '',
        college: lead.college || '',
        course: lead.course || 'Full Stack Web Development (MERN)',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        priority: lead.priority || 'Warm',
        counselor: lead.counselor || 'Pooja Verma',
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
    }
  });

  demoStore.stats.newLeadsThisMonth = (demoStore.stats.newLeadsThisMonth || 86) + added.length;
  res.status(201).json({ success: true, count: added.length, leads: added });
});

// Add Note to Lead Endpoint
app.post('/api/leads/:id/notes', (req, res) => {
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
    author: author || lead.counselor || 'Counselor'
  };
  if (!lead.notesList) lead.notesList = [];
  lead.notesList.unshift(newNote);
  res.status(201).json({ success: true, note: newNote });
});

// Log Call for Lead Endpoint
app.post('/api/leads/:id/calls', (req, res) => {
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
    counselor: counselor || lead.counselor || 'Counselor'
  };
  if (!lead.callHistory) lead.callHistory = [];
  lead.callHistory.unshift(newCall);
  if (nextFollowUpDate) {
    lead.nextFollowUpDate = nextFollowUpDate;
  }
  res.status(201).json({ success: true, call: newCall, nextFollowUpDate: lead.nextFollowUpDate });
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

  // 1. Auto-generate Admission Number and Application Number
  const nextSeq = 40 + demoStore.admissions.length + 1;
  const admissionNo = `ADM-2026-00${nextSeq}`;
  const applicationNo = `APP-2026-0${80 + nextSeq}`;

  const numTotalFee = Number(totalCourseFee) || 45000;
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
    batch: batch || 'FSWD Morning Batch (M26)',
    duration: duration || '16 Weeks',
    admissionDate: admissionDate || new Date().toISOString().split('T')[0],
    totalCourseFee: numTotalFee,
    discount: numDiscount,
    discountReason: discountReason || '',
    netFee: numNetFee,
    admissionFeePaid: numPaid,
    feeDue: numDue,
    paymentPlan: paymentPlan || '2 Installments (50/50)',
    status: status || 'Admission Confirmed',
    counselor: counselor || 'Pooja Verma',
    notes: notes || 'Direct admission conversion.'
  };

  demoStore.admissions.unshift(newAdmission);
  demoStore.stats.confirmedAdmissions = (demoStore.stats.confirmedAdmissions || 24) + 1;

  // 2. If converted from a lead, mark lead as "Converted to Admission"
  if (leadId) {
    const lIdx = demoStore.recentLeads.findIndex(l => l.id === Number(leadId));
    if (lIdx !== -1) {
      demoStore.recentLeads[lIdx].status = 'Enrolled / Admitted';
      demoStore.recentLeads[lIdx].admissionNo = admissionNo;
    }
  }

  // 3. Auto-create Enrolled Student Record in students directory without re-entering
  const newStudent = {
    id: demoStore.students.length + 1,
    studentId: `STU-2026-0${80 + demoStore.students.length + 1}`,
    admissionNo,
    name: studentName,
    email: email || '',
    phone,
    guardian: guardianName || 'Guardian',
    guardianPhone: guardianPhone || '',
    course,
    batch: batch || 'FSWD Morning Batch (M26)',
    enrollmentDate: admissionDate || new Date().toISOString().split('T')[0],
    feeTotal: numNetFee,
    feePaid: numPaid,
    feeDue: numDue,
    feeStatus: numDue === 0 ? 'Paid' : 'Partial',
    attendance: 100,
    status: 'Active'
  };
  demoStore.students.unshift(newStudent);
  demoStore.stats.totalStudents += 1;

  // 4. If an admission fee was collected, generate payment receipt
  if (numPaid > 0) {
    const newReceipt = {
      receiptNo: `RCP-2026-0${90 + demoStore.feeTransactions.length + 1}`,
      studentName,
      studentId: newStudent.studentId,
      course,
      amount: numPaid,
      mode: 'Admission Registration (UPI / Bank)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      collectedBy: counselor || 'Accounts Desk',
      status: 'Success'
    };
    demoStore.feeTransactions.unshift(newReceipt);
    demoStore.stats.monthlyRevenue += numPaid;
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

// Batches API
app.get('/api/batches', (req, res) => {
  res.json({ success: true, data: demoStore.batches });
});

// Fees API
app.get('/api/fees', (req, res) => {
  res.json({ success: true, data: demoStore.feeTransactions });
});

app.post('/api/fees', (req, res) => {
  const { studentName, studentId, course, amount, mode } = req.body;
  const numAmount = Number(amount) || 0;

  const newReceipt = {
    receiptNo: `RCP-2026-0${90 + demoStore.feeTransactions.length + 1}`,
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
  demoStore.stats.monthlyRevenue += numAmount;

  // Update student fee balance
  const student = demoStore.students.find(s => s.studentId === studentId || s.name.toLowerCase() === studentName.toLowerCase());
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
